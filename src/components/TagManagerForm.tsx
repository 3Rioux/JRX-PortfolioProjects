import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";

type TagObj = {
  id: string;
  name: string;
  category: string;
};


const colorPalette = [
    "#000000", "#00FF00", "#0000FF", "#FF0000", "#01FFFE", "#FFA6FE", "#FFDB66", "#006401",
    "#010067", "#95003A", "#007DB5", "#FF00F6", "#FFEEE8", "#774D00", "#90FB92", "#0076FF",
    "#D5FF00", "#FF937E", "#6A826C", "#FF029D", "#FE8900", "#7A4782", "#7E2DD2", "#85A900",
    "#FF0056", "#A42400", "#00AE7E", "#683D3B", "#BDC6FF", "#263400", "#BDD393", "#00B917",
    "#9E008E", "#001544", "#C28C9F", "#FF74A3", "#01D0FF", "#004754", "#E56FFE", "#788231",
    "#0E4CA1", "#91D0CB", "#BE9970", "#968AE8", "#BB8800", "#43002C", "#DEFF74", "#00FFC6",
    "#FFE502", "#620E00", "#008F9C", "#98FF52", "#7544B1", "#B500FF", "#00FF78", "#FF6E41",
    "#005F39", "#6B6882", "#5FAD4E", "#A75740", "#A5FFD2", "#FFB167", "#009BFF", "#E85EBE"
  ];
  

export default function TagManagerForm() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tags, setTags] = useState<TagObj[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | "warning" | null>(null);
    const [sortMode, setSortMode] = useState<"asc" | "desc" | "category">("asc");
    const [message, setMessage] = useState("");


    const [newTagName, setNewTagName] = useState("");
    const [newTagCategory, setNewTagCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");

   
    // ======  State Animation ======
    // Reset glow effect after 1s
    useEffect(() => {
        if (status) {
        const timer = setTimeout(() => setStatus(null), 600);
        return () => clearTimeout(timer);
        }
    }, [status]);


    // fetch tags on mount
    useEffect(() => {
        const fetchTags = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("tags").select("*");
        if (error) {
            console.error("Error fetching tags:", error.message);
            setStatus("error");
        } else {
            setTags(data as TagObj[]);
        }
        setLoading(false);
        };
        fetchTags();
    }, []);

  // get list of categories from current tags
  const categories = Array.from(new Set(tags.map((t) => t.category))).sort();

   // Update existing tag
   const handleUpdateTag = async (id: string, name: string, category: string) => {
    const { error } = await supabase
      .from("tags")
      .update({ name, category })
      .eq("id", id);

    if (error) {
      console.error("Error updating tag:", error.message);
      setMessage("❌ Failed to update tag");
      setStatus("error");
    } else {
      setMessage("✅ Tag updated");
      setTags((prev) =>
        prev.map((t) => (t.id === id ? { ...t, name, category } : t))
      );
      setStatus("success");
    }
  };

  // handle adding new tag
  const addNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    console.log('newTagCategory:', newTagCategory);
    console.log('customCategory:', customCategory);

    const finalCategory = newTagCategory === "__custom" ? customCategory : newTagCategory;

    if (!newTagName.trim() || !finalCategory.trim()) {
      setMessage("Please enter both tag name and category.");
      return;
    }

    // prevent duplicate names
    if (tags.some((t) => t.name.toLowerCase() === newTagName.toLowerCase())) {
        setMessage("⚠️ Tag name already exists");
        setStatus("warning");
        return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("tags")
      .insert([{ name: newTagName.trim(), category: finalCategory.trim() }])
      .select();

    if (error) {
      console.error("Error adding new tag:", error.message);
      setMessage("❌ Failed to add tag");
      setStatus("error");
    } else if (data) {
        setMessage("✅ Tag added");
        setTags([...tags, data[0] as TagObj]);
        setNewTagName("");
        setNewTagCategory("");
        setCustomCategory("");
        setStatus("success");
    }

    setLoading(false);
  };

  // --- Sorting logic ---
  const getSortedTags = () => {
    if (sortMode === "asc") {
      return [...tags].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "desc") {
      return [...tags].sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // group by category
      return [...tags].sort((a, b) => {
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return a.category.localeCompare(b.category);
      });
    }
  };

  const sortedTags = getSortedTags();

  //Sort Category Colors: 
  const categoryColorMap: { [key: string]: string } = {};
//   function getCategoryColor(category: string) {
//       // Simple hash function to get a number from the string
//       let hash = 0;
//       for (let i = 0; i < category.length; i++) {
//       hash = category.charCodeAt(i) + ((hash << 5) - hash);
//       }
  
//       // Convert hash to HSL color
//       const hue = hash % 360;
//       return `hsl(${hue}, 70%, 70%)`; // pastel-like colors
//   }
  
    function getCategoryColor(category: string) {
        if (categoryColorMap[category]) return categoryColorMap[category];
    
        // Simple hash to get a consistent index
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
    
        const index = Math.abs(hash) % colorPalette.length;
        const color = colorPalette[index];
        categoryColorMap[category] = color;
        return color;
    }
  
  

return (
    // <div className="bg-muted text-foreground border shadow-sm p-4 rounded-xl max-w-xl mx-auto mt-10">
    <div
      className={`
        bg-muted text-foreground border shadow-sm p-4 rounded-xl max-w-xxl mx-auto mt-10
        transition-all duration-600
        ${status === "success" ? "ring-8 ring-green-400" : ""}
        ${status === "warning" ? "ring-8 ring-yellow-300" : ""}
        ${status === "error" ? "ring-8 ring-red-500" : ""}
      `}
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-4 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        ← Back
      </button>

      <div className="flex flex-col gap-2 max-w-xl mx-auto dark:text-violet-500">
        {user ? (
          <p className="border-4 border-solid text-center">
            Managing Tags as - {user.email}
          </p>
        ) : (
          <p>Not logged in</p>
        )}
      </div>

      <div className="flex justify-between items-center mb-4 p-2 pl-0">
        <h2 className="font-bold text-xl dark:text-white p-2">Manage Tags:</h2>

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as "asc" | "desc" | "category")}
          className="p-1 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        >
          <option value="asc">Name (A → Z)</option>
          <option value="desc">Name (Z → A)</option>
          <option value="category">Group by Category</option>
        </select>
      </div>

      {/* Divider between projects and tags  */}
      <div className='mb-4 border-b-3 '></div>

    <div className="flex justify-between items-center mb-4 p-2 pl-0">
        {/* Existing tags list */}
        <div className="
        grid gap-4
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        ">
        {sortedTags.map((tag) => (
            <div 
            key={tag.id} 
            className="flex gap-2 items-center border-b-4 border-primary"
            style={{ borderColor: getCategoryColor(tag.category) }}
            >
                {/* <div
                    className="w-3 h-3 min-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(tag.category) }}>
                </div> */}
                <input
                type="text"
                value={tag.name}
                onChange={(e) =>
                    setTags((prev) =>
                    prev.map((t) =>
                        t.id === tag.id ? { ...t, name: e.target.value } : t
                    )
                    )
                }
                className="min-w-24 flex-1 p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white flex-1"
                />
                <select
                value={tag.category}
                onChange={(e) =>
                    setTags((prev) =>
                    prev.map((t) =>
                        t.id === tag.id ? { ...t, category: e.target.value } : t
                    )
                    )
                }
                className="min-w-12 p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                >
                {categories.map((c) => (
                    <option key={c} value={c}>
                    {c}
                    </option>
                ))}
                </select>
                <button
                    onClick={() => handleUpdateTag(tag.id, tag.name, tag.category)}
                    className="min-w-12 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                Save
                </button>
            </div>
            ))}
        </div>
      </div>

        {/* Divider between projects and tags  */}
        <div className='mb-4 border-b-3 '></div>

      {/* Add new tag form */}
      <form onSubmit={addNewTag} className="flex flex-col gap-3 mx-auto">
        <h3 className="font-semibold text-lg dark:text-white">Add New Tag</h3>
        <input
          type="text"
          placeholder="Tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          required
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />

        <select
          value={newTagCategory}
          onChange={(e) => setNewTagCategory(e.target.value)}
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        >
          <option value="">-- Select category --</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__custom">+ New Category...</option>
        </select>

        {newTagCategory === "__custom" && (
          <input
            type="text"
            placeholder="Enter new category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          {loading ? "Adding..." : "Add Tag"}
        </button>
      </form>

      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}

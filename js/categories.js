const apiBaseUrl = "http://45.130.148.64:8080/api/v1/";

const categoryForm = document.getElementById("categoryForm");
const categoryInput = document.getElementById("category");
const categoryIdInput = document.getElementById("category-id"); // Hidden input for editing
const categoryList = document.getElementById("categoryList"); // Select from HTML

// **🔹 Load Categories**
async function loadCategories() {
  categoryList.innerHTML = "";
  try {
    const res = await fetch(`${apiBaseUrl}category/all`);
    if (!res.ok) throw new Error("Failed to fetch categories");

    const categories = await res.json();
    categories.data.forEach((category) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${category.name}
        <button onclick="editCategory(${category.id}, '${category.name}')">Edit</button>
        <button onclick="deleteCategory(${category.id})">Delete</button>
      `;
      categoryList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// **🔹 Add or Update Category**
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const categoryId = categoryIdInput.value;
  categoryId ? await updateCategory(categoryId) : await addCategory();
});

// **🔹 Add Category**
async function addCategory() {
  let accessToken = localStorage.getItem("accessToken");
  const categoryData = { name: categoryInput.value };

  try {
    const res = await fetch(`${apiBaseUrl}category/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!res.ok) throw new Error("Failed to add category");

    alert("Category added successfully!");
    categoryForm.reset();
    categoryIdInput.value = ""; // Ensure ID is cleared
    categoryForm.querySelector("button").textContent = "Add Category";
    loadCategories();
  } catch (error) {
    console.error("Error:", error);
  }
}

// **🔹 Edit Category**
function editCategory(categoryId, name) {
  categoryInput.value = name;
  categoryIdInput.value = categoryId; // Store the ID for updating
  categoryForm.querySelector("button").textContent = "Update Category";
}

// **🔹 Update Category**
async function updateCategory(categoryId) {
  let accessToken = localStorage.getItem("accessToken");
  const updatedData = {
    id: categoryId, // Include ID in the request body
    name: categoryInput.value,
  };

  try {
    const res = await fetch(`${apiBaseUrl}category/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error("Failed to update category");

    alert("Category updated successfully!");
    categoryForm.reset();
    categoryIdInput.value = ""; // Clear stored ID
    categoryForm.querySelector("button").textContent = "Add Category"; // Reset button text
    loadCategories();
  } catch (error) {
    console.error("Error:", error);
  }
}

// **🔹 Delete Category**
async function deleteCategory(categoryId) {
  if (!confirm("Are you sure you want to delete this category?")) return;
  let accessToken = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`${apiBaseUrl}category/delete/${categoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete category");

    alert("Category deleted successfully!");
    loadCategories();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Load categories on page load
loadCategories();

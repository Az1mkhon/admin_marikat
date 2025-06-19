const apiBaseUrl = "http://api.marikat.uz/api/v1/sizes"; // Base URL
let accessToken = localStorage.getItem("accessToken");

// **🔹 Load All Sizes**
async function getAllSizes() {
  try {
    const res = await fetch(`${apiBaseUrl}/all`);
    if (!res.ok) throw new Error("Failed to fetch sizes");

    const sizes = await res.json();
    displaySizes(sizes);
  } catch (error) {
    console.error("Error fetching sizes:", error);
  }
}

// **🔹 Display Sizes in the List**
function displaySizes(sizes) {
  const sizeList = document.getElementById("sizeList");
  sizeList.innerHTML = ""; // Clear old list

  sizes.data.forEach((size) => {
    const li = document.createElement("li");
    li.innerHTML = `
                    ID:${size.id} ${size.size}
                    <button onclick="editSize(${size.id}, '${size.size}')">Edit</button>
                    <button onclick="deleteSize(${size.id})">Delete</button>
                `;
    sizeList.appendChild(li);
  });
}

// **🔹 Handle Form Submission (Add or Edit)**
document
  .getElementById("sizeForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const sizeId = document.getElementById("sizeId").value;
    const sizeName = document.getElementById("sizeName").value.trim();

    if (sizeId) {
      await updateSize(sizeId, sizeName);
    } else {
      await addSize(sizeName);
    }
  });

// **🔹 Add a New Size**
async function addSize(sizeName) {
  try {
    const res = await fetch(`${apiBaseUrl}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ size: sizeName }),
    });

    if (res.status === 200) {
      alert("Size added successfully!");
      document.getElementById("sizeForm").reset();
      getAllSizes(); // Refresh list
    } else {
      throw new Error("Failed to add size");
    }
  } catch (error) {
    console.error("Error adding size:", error);
  }
}

// **🔹 Set Form for Editing**
function editSize(sizeId, sizeName) {
  document.getElementById("sizeId").value = sizeId;
  document.getElementById("sizeName").value = sizeName;
  document.querySelector("button[type='submit']").textContent = "Update Size";
}

// **🔹 Update a Size**
async function updateSize(sizeId, updatedName) {
  try {
    const res = await fetch(`${apiBaseUrl}/edit/${sizeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ size: updatedName }),
    });

    if (res.status === 200) {
      alert("Size updated successfully!");
      document.getElementById("sizeForm").reset();
      document.getElementById("sizeId").value = "";
      document.querySelector("button[type='submit']").textContent = "Add Size";
      getAllSizes(); // Refresh list
    } else {
      throw new Error("Failed to update size");
    }
  } catch (error) {
    console.error("Error updating size:", error);
  }
}

// **🔹 Delete a Size**
async function deleteSize(sizeId) {
  if (!confirm("Are you sure you want to delete this size?")) return;

  try {
    const res = await fetch(`${apiBaseUrl}/delete/${sizeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 200) {
      alert("Size deleted successfully!");
      getAllSizes(); // Refresh list
    } else if (res.status === 404) {
      alert("Size not found!");
    } else {
      throw new Error("Failed to delete size");
    }
  } catch (error) {
    console.error("Error deleting size:", error);
  }
}

// **🔹 Load sizes on page load**
getAllSizes();

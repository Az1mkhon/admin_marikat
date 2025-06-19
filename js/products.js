const imageUploadInput = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const frontImageUploadInput = document.getElementById("frontImageUpload");
const frontImagePreview = document.getElementById("frontImagePreview");
let selectedImages = [];
let accessToken = localStorage.getItem("accessToken");
const apiBase = "https://api.marikat.uz/api/v1/";

function addRemoveFrontButton() {
  const existing = document.getElementById("removeFrontBtn");
  if (existing) existing.remove();

  const removeBtn = document.createElement("button");
  removeBtn.id = "removeFrontBtn";
  removeBtn.textContent = "X";
  removeBtn.style.position = "absolute";
  removeBtn.style.left = "0";
  removeBtn.style.top = "0";
  removeBtn.style.background = "red";
  removeBtn.style.color = "white";
  removeBtn.style.border = "none";
  removeBtn.style.cursor = "pointer";
  removeBtn.onclick = () => {
    frontImageUploadInput.value = "";
    frontImagePreview.src = "";
    frontImagePreview.style.display = "none";
    removeBtn.remove();
    if (editingProduct) editingProduct.frontImg = "";
  };
  frontImagePreview.parentNode.appendChild(removeBtn);
}

imageUploadInput.addEventListener("change", function (event) {
  if (selectedImages.length + event.target.files.length > 4) {
    alert("You must upload exactly 4 images.");
    return;
  }

  for (let file of event.target.files) {
    if (selectedImages.length < 4) {
      selectedImages.push(file);
      const imgContainer = document.createElement("div");
      imgContainer.style.display = "inline-block";
      imgContainer.style.position = "relative";
      imgContainer.style.margin = "5px";

      const imgElement = document.createElement("img");
      imgElement.src = URL.createObjectURL(file);
      imgElement.style.maxWidth = "100px";

      const removeButton = document.createElement("button");
      removeButton.textContent = "X";
      removeButton.style.position = "absolute";
      removeButton.style.top = "0";
      removeButton.style.right = "0";
      removeButton.style.background = "red";
      removeButton.style.color = "white";
      removeButton.style.border = "none";
      removeButton.style.cursor = "pointer";
      removeButton.addEventListener("click", () => {
        imgContainer.remove();
        selectedImages = selectedImages.filter((img) => img !== file);
      });

      imgContainer.appendChild(imgElement);
      imgContainer.appendChild(removeButton);
      imagePreview.appendChild(imgContainer);
    }
  }
});

frontImageUploadInput.addEventListener("change", function (event) {
  if (event.target.files.length > 0) {
    frontImagePreview.src = URL.createObjectURL(event.target.files[0]);
    frontImagePreview.style.display = "block";
    addRemoveFrontButton();
  }
});

document
  .getElementById("productForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (selectedImages.length !== 4) {
      alert("You must upload exactly 4 images.");
      return;
    }

    const imgBBKey = "7f025a7d9af76d652cc69daaea11b204";

    const uploadToImgBB = async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgBBKey}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      return data.success ? data.data.url : null;
    };

    const name = document.getElementById("name").value;
    const price = parseFloat(document.getElementById("price").value);
    const color = document.getElementById("color").value;
    const details = document.getElementById("details").value;
    const categoryId = parseInt(document.getElementById("categoryId").value);
    const sizeIds = document
      .getElementById("sizeIds")
      .value.split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    const sizes = sizeIds.map((id) => ({ id }));

    let imageUrls = [];
    for (let file of selectedImages) {
      const url = await uploadToImgBB(file);
      if (url) imageUrls.push(url);
    }

    const frontImageFile = frontImageUploadInput.files[0];
    if (!frontImageFile) {
      alert("You must upload a front image.");
      return;
    }

    let frontImg = await uploadToImgBB(frontImageFile);
    if (!frontImg) {
      alert("Front image upload failed.");
      return;
    }

    const productData = {
      name,
      price,
      color,
      details,
      categoryId,
      frontImg,
      imageUrls,
      sizeIds,
      sizes,
    };

    const backendResponse = await fetch(`${apiBase}products/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(productData),
    });

    const result = await backendResponse.json();
    if (backendResponse.ok) {

      alert("Product added successfully!");
      document.getElementById("productForm").reset();
      imagePreview.innerHTML = "";
      frontImagePreview.style.display = "none";
      selectedImages = [];
    } else {
      alert("Failed to add product: " + (result.message || "Unknown error"));
    }
  });

// Fetch all products and display in the table
const fetchProducts = async () => {
  const response = await fetch(`${apiBase}products/all`);
  const products = await response.json();
  const productList = document.getElementById("productList");
  productList.innerHTML = ""; // Clear existing rows
  products.data.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.price}</td>
                    <td>${product.color}</td>
                    <td>${product.categoryId}</td>
                    <td>
                        <button onclick="deleteProduct(${product.id})">Delete</button>
                        <button onclick="update(${product.id})">Edit</button>
                    </td>
                `;
    productList.appendChild(row);
  });
};

const update = async (productId) => {
  // Fetch the product details
  const response = await fetch(`${apiBase}products/one/${productId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const product = await response.json();

  if (!product) {
    alert("Product not found!");
    return;
  }

  // Pre-fill the form with the existing product details
  document.getElementById("name").value = product.data.name;
  document.getElementById("price").value = product.data.price;
  document.getElementById("color").value = product.data.color;
  document.getElementById("details").value = product.data.details || "";
  document.getElementById("categoryId").value = product.data.categoryId;
  document.getElementById("sizeIds").value = product.data.sizeIds.join(",");

  // Pre-fill image URLs (4 images)
  const imagePreview = document.getElementById("imagePreview");
  imagePreview.innerHTML = ""; // Clear previous previews
  product.data.imageUrls.forEach((url) => {
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";
    container.style.margin = "5px";

    const imgElement = document.createElement("img");
    imgElement.src = url;
    imgElement.style.maxWidth = "100px";
    imgElement.style.margin = "5px";

    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.style.position = "absolute";
    btn.style.top = "0";
    btn.style.right = "0";
    btn.style.background = "red";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      container.remove();
      editingProduct.imageUrls = editingProduct.imageUrls.filter(
        (_, i) => i !== index
      );
    };
    container.appendChild(imgElement);
    container.appendChild(btn);
    imagePreview.appendChild(container);
  });

  // Pre-fill front image URL
  const frontImagePreview = document.getElementById("frontImagePreview");
  frontImagePreview.style.display = "block";
  frontImagePreview.src = product.data.frontImg;
  addRemoveFrontButton();

  // Change the form submit button to "Update Product"
  const submitButton = document.querySelector("button[type='submit']");
  submitButton.textContent = "Update Product";

  // Handle form submission for updating
  const originalSubmitHandler = submitButton.onclick;
  submitButton.onclick = async (event) => {
    event.preventDefault();

    // Prepare the updated product data
    const updatedProduct = {
      name: document.getElementById("name").value,
      price: parseFloat(document.getElementById("price").value),
      color: document.getElementById("color").value,
      details: document.getElementById("details").value,
      categoryId: parseInt(document.getElementById("categoryId").value),
      sizeIds: document.getElementById("sizeIds").value.split(",").map(Number),
      imageUrls: [], // This will hold the new image URLs (4 images)
      frontImg: "", // This will hold the new front image URL
    };

    // Handle the image uploads (if new images are provided)
    const newImageFiles = document.getElementById("imageUpload").files;
    if (newImageFiles.length > 0) {
      updatedProduct.imageUrls = []; // Reset only if new images are uploaded
      for (let file of newImageFiles) {
        const url = await uploadToImgBB(file);
        if (url) updatedProduct.imageUrls.push(url);
      }
    } else {
      updatedProduct.imageUrls = []; // Keep old images without modifying them
    }

    const frontImageFile = document.getElementById("frontImageUpload").files[0];
    if (frontImageFile) {
      const frontImgUrl = await uploadToImgBB(frontImageFile); // Upload the front image
      updatedProduct.frontImg = frontImgUrl;
    } else {
      updatedProduct.frontImg = product.data.frontImg; // Keep the old front image if none is uploaded
    }

    // Update the product
    const updateResponse = await fetch(`${apiBase}products/edit/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Include token if needed
      },
      body: JSON.stringify(updatedProduct),
    });

    if (updateResponse.ok) {
      alert("Product updated successfully!");
      fetchProducts();
      const imagePreview = document.getElementById("imagePreview");
      imagePreview.innerHTML = ""; // Clear image previews
      const frontImagePreview = document.getElementById("frontImagePreview");
      frontImagePreview.style.display = "none";
      document.getElementById("productForm").reset();
      submitButton.textContent = "Add Product"; // Reset submit button text
    } else {
      alert("Failed to update product.");
    }
  };
};

const deleteProduct = async (productId) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this product?"
  );
  if (!confirmDelete) return;

  const response = await fetch(`${apiBase}products/delete/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    alert("Product deleted successfully!");
    fetchProducts();
  } else {
    alert("Failed to delete product.");
  }
};

// Initial product list fetch
fetchProducts();

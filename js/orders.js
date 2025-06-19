const apiBaseUrl = "https://api.marikat.uz/api/v1/";

const orderTable = document.getElementById("orderTable");

// **🔹 Load Orders**
async function loadOrders() {
  orderTable.innerHTML = "";
  let accessToken = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`${apiBaseUrl}order/all`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch orders");

    const orders = await res.json();
    orders.forEach((order) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${order.firstName} ${order.lastName}</td>
                <td>${order.phone}</td>
                <td>${order.email}</td>
                <td>${order.address}</td>
                <td>${order.products
                  .map((p) => `${p.productName} (x${p.count})`)
                  .join(", ")}</td>`;
      orderTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

// Load orders on page load
loadOrders();

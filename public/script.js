document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/products.html') {
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                const productList = document.getElementById('product-list');
                products.forEach(product => {
                    const productDiv = document.createElement('div');
                    productDiv.className = 'product';
                    productDiv.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>Owner: ${product.owner.username}</p>
                    `;
                    productList.appendChild(productDiv);
                });
            });
    }
});

fetch('https://fakestoreapi.com/products')
    .then(res => res.json())
    .then(products => {

        const container = document.getElementById('product-list');
        let totalQantitiy = 0, totalPrice = 0;

        function displayProducts(products){
            container.innerHTML = "";

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <p>${product.price} $</p>
                `;
                container.appendChild(card);

                // Add Button
                const addBtn = document.createElement('button');
                addBtn.className = 'add';
                addBtn.textContent = 'Add to Cart';
                card.appendChild(addBtn);
                let cart = {};
                addBtn.addEventListener('click', ()=> {
                    const productId = product.id;

                    totalQantitiy++;
                    document.querySelector('.totalQ').textContent = totalQantitiy;
                    totalPrice += product.price;
                    document.querySelector('.totalP').textContent = totalPrice.toFixed(2);

                    const cartItem = document.createElement('li');
                    cartItem.textContent = `${product.title} - $${product.price}`;

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove';
                    removeBtn.textContent = 'Remove';
                    cartItem.appendChild(removeBtn);

                    document.getElementById('cart-list').appendChild(cartItem);

                    removeBtn.addEventListener('click', ()=>{
                        cartItem.remove();
                        totalQantitiy--;
                        document.querySelector('.totalQ').textContent = totalQantitiy;

                        totalPrice -= product.price;
                        if (totalPrice < 0) totalPrice = 0;
                        document.querySelector('.totalP').textContent = totalPrice.toFixed(2);
                    })  
                })   

                // Details Button 
                const detailsBtn = document.createElement('button');
                detailsBtn.className = 'details';
                detailsBtn.textContent = 'View Details';
                card.appendChild(detailsBtn);

                const modalForDetails = document.createElement('div');
                modalForDetails.className = 'modal';
                modalForDetails.style.display = 'none';
                modalForDetails.innerHTML = `
                    <div class="modal-content">
                    <img src="${product.image}" alt="${product.title}">
                    <span class="close">&times;</span>
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Rating:</strong> ${product.rating.rate} ⭐</p>
                    </div>
                `;

                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                overlay.style.display = 'none';

                detailsBtn.addEventListener('click', () => {
                    modalForDetails.style.display = 'block';
                    overlay.style.display = 'block';
                })

                document.body.appendChild(modalForDetails);
                document.body.appendChild(overlay);
            
                const close = document.querySelectorAll('.close');
                close.forEach(c => {
                    c.addEventListener('click', () => {
                        modalForDetails.style.display = 'none';
                        overlay.style.display = 'none';
                    })
                })
            })
        }

        // ==============================================================
        // ==============================================================
        
        // Pagination
        const PaginationProducts = [...products];
        const productsPerPage = 6;
        let currentPage = 1;
        console.log("Number of products: ", PaginationProducts.length);


        function getPaginatedProducts(page) {
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            return PaginationProducts.slice(start, end);
        }

        function setupPagination() {
            const paginationContainer = document.getElementById("pagination");
            paginationContainer.innerHTML = "";

            // 20 / 6 = 3.33 => 4
            const totalPages = Math.ceil(PaginationProducts.length / productsPerPage);
            console.log("totalPages: ", totalPages);
            

            const previousBtn = document.createElement('button');
            previousBtn.textContent = 'Previous';
            previousBtn.className = 'prev';
            paginationContainer.appendChild(previousBtn);

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.className = 'paginationBtn'
                btn.textContent = i;
                if (i === currentPage) {
                    btn.classList.add("active"); 
                }
                paginationContainer.appendChild(btn);
            }            

            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.className = 'nxt';
            paginationContainer.appendChild(nextBtn);          
            
            const pageButtons = [...paginationContainer.querySelectorAll('.paginationBtn')];
            console.log(pageButtons);

            pageButtons.forEach((btn) => {
                btn.addEventListener("click", () => {
                    pageButtons.forEach(b => b.classList.remove("active"));
                    currentPage = Number(btn.textContent);
                    btn.classList.add("active");
                    const paginated = getPaginatedProducts(currentPage);
                    displayProducts(paginated);
                });
            })

            function updateActiveButton() {
                pageButtons.forEach(btn => {
                    btn.classList.remove("active");
                    if (+btn.textContent === currentPage) {
                        btn.classList.add("active");
                    }
                });

                previousBtn.disabled = currentPage === 1;
                nextBtn.disabled = currentPage === totalPages;
            }

            previousBtn.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayProducts(getPaginatedProducts(currentPage));
                    updateActiveButton()
                }
            });

            nextBtn.addEventListener("click", () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayProducts(getPaginatedProducts(currentPage));
                    updateActiveButton()
                }
            });
        }




        // ==============================================================
        
        const form = document.getElementById('filter-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            currentPage = 1;


            const searchValue = document.getElementById("search").value.toLowerCase().trim();
            const categoryValue = document.getElementById("category").value;
            const minPriceValue = parseFloat(document.getElementById("min-price").value) || 0;
            const maxPriceValue = parseFloat(document.getElementById("max-price").value) || Infinity;
            const sortValue = document.getElementById("sort").value;

            console.log("Search:", searchValue);
            console.log("Category:", categoryValue);
            console.log("Min Price:", minPriceValue);
            console.log("Max Price:", maxPriceValue);
            console.log("Sort:", sortValue);

            let paginated = PaginationProducts;

            if(!(minPriceValue === 0 && maxPriceValue === Infinity && categoryValue === "" && searchValue === "")){
                paginated = paginated.filter((product) => {
                    return (
                        minPriceValue <= product.price && product.price <= maxPriceValue
                        && (categoryValue === "" || product.category === categoryValue) 
                        && product.title.toLowerCase().includes(searchValue)
                    );
                });
            }

            switch(sortValue){
                case 'price-low-to-high':
                    paginated.sort((a,b) => a.price - b.price);
                    break;
                case 'price-high-to-low':
                    paginated.sort((a,b) => b.price - a.price);
                    break;
                case 'rating-high-to-low':
                    paginated.sort((a,b) => b.rating.rate - a.rating.rate);
                    break;
                case 'rating-low-to-high':
                    paginated.sort((a,b) => a.rating.rate - b.rating.rate);
                break;

                default:
                    console.log("Invalid sort value");
            }

            displayProducts(paginated);
        })
        
        displayProducts(getPaginatedProducts(currentPage));
        setupPagination();
        
    });

// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Function to load HTML partials
    async function loadHtmlPartial(filePath, elementId, callback) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            const html = await response.text();
            const targetElement = document.getElementById(elementId);
            if (targetElement) {
                targetElement.innerHTML = html;
                if (callback && typeof callback === 'function') {
                    callback(); // Execute callback after HTML is injected
                }
            } else {
                console.warn(`Element with ID '${elementId}' not found for ${filePath}`);
            }
        } catch (error) {
            console.error('Error loading HTML partial:', error);
        }
    }

    // Function to initialize all header-related scripts
    function initializeHeaderScripts() {
        const headerWrapper = document.getElementById('header-wrapper');
        const mainHeader = document.getElementById('main-header');
        const menuItems = document.querySelectorAll('.has-submenu');
        
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const closeMenuButton = document.getElementById('close-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        // --- LÓGICA DO MENU SANFONA (ACCORDION) PARA MOBILE ---
        const accordionTriggers = document.querySelectorAll('.accordion-trigger');
        accordionTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const content = trigger.nextElementSibling; // O conteúdo é o próximo elemento
                trigger.classList.toggle('open');
                content.classList.toggle('hidden-element');
            });
        });

        // Lógica do menu desktop
        let activeSubmenu = null;
        let activeMenuItem = null;

        function hideAllSubmenus() {
            if (activeSubmenu) activeSubmenu.classList.add('hidden-element');
            if (activeMenuItem) {
                activeMenuItem.querySelector('.arrow-down').classList.remove('hidden-element');
                activeMenuItem.querySelector('.arrow-up').classList.add('hidden-element');
            }
            activeSubmenu = null;
            activeMenuItem = null;
        }

        menuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                hideAllSubmenus();
                const targetId = item.dataset.target;
                const targetSubmenu = document.getElementById('submenu-' + targetId);
                if (targetSubmenu) {
                    targetSubmenu.classList.remove('hidden-element');
                    item.querySelector('.arrow-down').classList.add('hidden-element');
                    item.querySelector('.arrow-up').classList.remove('hidden-element');
                    activeSubmenu = targetSubmenu;
                    activeMenuItem = item;
                }
            });
        });

        if (headerWrapper) { // Ensure headerWrapper exists before adding listener
             headerWrapper.addEventListener('mouseleave', () => {
                hideAllSubmenus();
            });
        }


        // Lógica para abrir/fechar menu móvel
        if (mobileMenuButton && mobileMenu && closeMenuButton) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.add('open');
            });

            closeMenuButton.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
            });
        } else {
            console.warn("Mobile menu buttons or menu itself not found.")
        }

        // Lógica do scroll do header
        if (mainHeader) { // Ensure mainHeader exists
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('header-scrolled');
                    mainHeader.classList.remove('glassmorphism');
                } else {
                    mainHeader.classList.remove('header-scrolled');
                    mainHeader.classList.add('glassmorphism');
                }
            });
        }
    }

    // Function to dynamically generate "JUMP TO" links
    function generateJumpToLinks() {
        const jumpToContent = document.getElementById('jump-to-content');
        const mainContent = document.querySelector('main');

        if (!jumpToContent || !mainContent) {
            console.warn('Could not find jump-to-content or main element for generating links.');
            if (jumpToContent) jumpToContent.innerHTML = '<span class="font-bold text-gray-200">JUMP TO:</span> <span class="text-gray-500">No sections found.</span>';
            return;
        }

        // Clear existing (if any, though header.html should be empty) and add prefix
        jumpToContent.innerHTML = '<span class="font-bold text-gray-200">JUMP TO:</span>';
        
        // Find sections with an ID within the main content
        // We'll look for sections with a `data-jumpto-title` attribute for custom titles,
        // or fall back to the ID.
        const sections = mainContent.querySelectorAll('section[id]');
        
        if (sections.length === 0 && jumpToContent) {
             jumpToContent.innerHTML += ' <span class="text-gray-500">No sections defined for jump to.</span>';
             return;
        }

        sections.forEach(section => {
            const id = section.id;
            // Prefer data-jumpto-title, then h1/h2 inside section, then format ID
            let title = section.getAttribute('data-jumpto-title');
            if (!title) {
                const heading = section.querySelector('h1, h2, h3');
                if (heading) {
                    title = heading.textContent.trim().toUpperCase().split(' ').slice(1).join(' '); // "Seção TESTNET" -> "TESTNET"
                     if (!title) title = heading.textContent.trim().toUpperCase(); // Fallback if slice results in empty
                } else {
                    title = id.replace(/-/g, ' ').toUpperCase(); // Format ID as title
                }
            }
            
            if (id && title) {
                const link = document.createElement('a');
                link.href = `#${id}`;
                link.textContent = title;
                link.className = 'hover:text-white';
                jumpToContent.appendChild(link);
            }
        });
    }

    // Load Header, then initialize its scripts and generate jump links
    loadHtmlPartial('header.html', 'header-placeholder', () => {
        initializeHeaderScripts();
        generateJumpToLinks(); // Generate jump links AFTER header is loaded and main content is in DOM
    });

    // Load Footer
    loadHtmlPartial('footer.html', 'footer-placeholder', () => {
        // Initialize any footer-specific scripts here if needed
        // For example, the current year script is already in footer.html,
        // but if it were more complex, you'd call an init function here.
         if (document.getElementById('current-year')) {
            document.getElementById('current-year').textContent = new Date().getFullYear();
        }
    });


    // --- LÓGICA DO MENU FLUTUANTE LATERAL (FAB) ---
    const fabButtons = document.querySelectorAll('.fab-button');
    const sideMenuPanel = document.getElementById('side-menu-panel');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const closeSideMenuButton = document.getElementById('close-side-menu');
    const sideMenuTitle = document.getElementById('side-menu-title');
    const sideMenuContent = document.getElementById('side-menu-content');

    const openSideMenu = (title, contentHTML) => {
        if (sideMenuTitle) sideMenuTitle.textContent = title;
        if (sideMenuContent) sideMenuContent.innerHTML = contentHTML;

        if (sideMenuPanel) sideMenuPanel.classList.add('open');
        if (sideMenuOverlay) {
            sideMenuOverlay.classList.remove('hidden-element'); // Remove hidden
            setTimeout(() => sideMenuOverlay.classList.add('visible'), 10); // Adiciona visible para animar opacidade
        }
        document.body.style.overflow = 'hidden'; // Impede rolagem do corpo
    };

    const closeSideMenu = () => {
        if (sideMenuPanel) sideMenuPanel.classList.remove('open');
        if (sideMenuOverlay) {
            sideMenuOverlay.classList.remove('visible');
            // Re-adiciona hidden-element após a transição de opacidade para garantir que não capture eventos
            setTimeout(() => sideMenuOverlay.classList.add('hidden-element'), 300); // 300ms = duração da transição
        }
        document.body.style.overflow = ''; // Restaura rolagem do corpo
    };

    if (fabButtons.length > 0 && sideMenuPanel && closeSideMenuButton && sideMenuOverlay) {
        fabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Conteúdo de exemplo baseado no ID do botão
                let title = "Menu";
                let contentHTML = "<p>Selecione uma opção.</p>";

                if (button.id === 'fab-chat') {

                    title = "Contato";
                    contentHTML = `
                        <h3 class="text-xl font-bold mb-4">Redes Sociais e Contato</h3>
                        <p class="text-gray-400 mb-6">Siga-nos para acompanhar nossas atualizações e novidades.</p>
                        <div class="flex flex-wrap gap-6 justify-center">
                        <a  href="https://www.facebook.com/UFABC" 
                            target="_blank" 
                            aria-label="Nossa página no Facebook" 
                            class="text-gray-400 
                            hover:text-blue-600 
                            transition-colors">
                            <img src="figs/facebook.svg" alt="Ícone do Facebook" class="w-10 h-10">
                        </a>
                        <a  href="https://www.instagram.com/ufabc/" 
                            target="_blank" 
                            aria-label="Nosso perfil no Instagram" 
                            class="text-gray-400 
                            hover:text-pink-500 
                            transition-colors">
                            <img src="figs/instagram.svg" alt="Ícone do Instagram" class="w-10 h-10">
                        </a>
                        <a href="https://www.linkedin.com/company/nuc-lab/" 
                               target="_blank" 
                               aria-label="Nosso perfil no LinkedIn" 
                               class="text-gray-400 
                               hover:text-blue-700 
                               transition-colors">
                            <img src="figs/linkedin.svg" alt="Ícone do LinkedIn" class="w-10 h-10">
                        </a>
                    
                        <a href="https://www.youtube.com/user/ufabcoficial" 
                               target="_blank" aria-label="Nosso canal no YouTube" class="text-gray-400 hover:text-red-600 
                               transition-colors">
                            <img src="figs/youtube.svg" alt="Ícone do YouTube" class="w-10 h-10">
                        </a>
                    
                        <a  href="https://x.com/nuc_lab" 
                            target="_blank" 
                            aria-label="Nosso perfil no X" 
                            class="text-gray-400 
                            hover:text-gray-200 
                            transition-colors">
                            <img src="figs/x.svg" alt="Ícone do Twitter" class="w-10 h-10">
                        </a>
                    </div>
                    
                    <div class="my-8 border-t border-gray-700"></div>
                    
                    <h3 class="text-xl font-bold mb-4">Grupos e Comunidades</h3>
                    <p class="text-gray-400 mb-6">Junte-se a nossa comunidade para discussões e informações em tempo real.</p>
                    <div class="flex flex-wrap gap-6 justify-center">

                        <a  href="[https://tecnoblog.net/](https://tecnoblog.net/)" 
                            target="_blank" 
                            aria-label="Nosso grupo no Telegram" 
                            class="text-gray-400 
                            hover:text-blue-500 
                            transition-colors">
                            <img src="figs/telegram.svg" alt="Ícone do Telegram" class="w-10 h-10">
                        </a>
                    
                        <a  href="[https://olhardigital.com.br/](https://olhardigital.com.br/)" 
                            target="_blank" 
                            aria-label="Nosso grupo no WhatsApp" 
                            class="text-gray-400 
                            hover:text-green-500 
                            transition-colors">
                            <img src="figs/whatsapp.svg" alt="Ícone do WhatsApp" class="w-10 h-10">
                        </a>
                    
                        
                        
                    </div>
                    `;



              
                    
                } 
                // else if (button.id === 'fab-cookies') {
                //     title = "Configurações de Cookies";
                //     contentHTML = ``;
                //}
                // Adicione mais 'else if' para outros botões FAB
                openSideMenu(title, contentHTML);
            });
        });

        closeSideMenuButton.addEventListener('click', closeSideMenu);
        sideMenuOverlay.addEventListener('click', closeSideMenu); // Fecha ao clicar no overlay

        // Opcional: Fechar com a tecla ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && sideMenuPanel.classList.contains('open')) {
                closeSideMenu();
            }
        });

    } else {
        console.warn("Elementos do FAB ou do menu lateral não encontrados. Funcionalidade não será ativada.");
    }

});

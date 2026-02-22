// Daily Scripture Rotation
const scriptures = [
    { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", ref: "John 3:16" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", ref: "Proverbs 3:5-6" },
    { text: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
    { text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.", ref: "Psalm 23:1-3" },
    { text: "For we walk by faith, not by sight.", ref: "2 Corinthians 5:7" },
    { text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", ref: "Romans 8:28" }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateDailyScripture();
    setupHamburgerMenu();
    loadEventsFromStorage();
    loadDevojialsFromStorage();
    setActiveNavLink();
});

// Update daily scripture
function updateDailyScripture() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const scriptureIndex = dayOfYear % scriptures.length;
    const scripture = scriptures[scriptureIndex];

    const scriptureElement = document.getElementById('dailyScripture');
    const refElement = document.querySelector('.scripture-ref');
    const dateElement = document.getElementById('scriptureDate');

    if (scriptureElement) scriptureElement.textContent = scripture.text;
    if (refElement) refElement.textContent = scripture.ref;
    if (dateElement) dateElement.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Hamburger menu toggle
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Set active nav link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Data Management (using localStorage)
class DataManager {
    static getEvents() {
        const stored = localStorage.getItem('patersEvents');
        if (stored) return JSON.parse(stored);
        return this.getDefaultEvents();
    }

    static getDefaultEvents() {
        return [{
                id: 1,
                title: "Sunday Worship Service",
                date: "2025-03-10",
                time: "10:00 AM",
                location: "Main Hall",
                description: "Join us for an inspiring worship session with powerful messages from our Man of God.",
                type: "upcoming"
            },
            {
                id: 2,
                title: "Mid-week Prayer Meeting",
                date: "2025-03-12",
                time: "6:00 PM",
                location: "Prayer Room",
                description: "A time of corporate prayer and intercession for our community.",
                type: "upcoming"
            },
            {
                id: 3,
                title: "Cell Group Fellowship",
                date: "2025-03-15",
                time: "7:00 PM",
                location: "Various Locations",
                description: "Multiple cell groups meeting for fellowship, study and prayer.",
                type: "upcoming"
            },
            {
                id: 4,
                title: "Quarterly Conference 2025",
                date: "2025-04-20",
                time: "9:00 AM",
                location: "Convention Center",
                description: "Annual gathering of all cells for renewal and strategic planning.",
                type: "upcoming"
            }
        ];
    }

    static saveEvents(events) {
        localStorage.setItem('patersEvents', JSON.stringify(events));
    }

    static getCells() {
        const stored = localStorage.getItem('patersCells');
        if (stored) return JSON.parse(stored);
        return this.getDefaultCells();
    }

    static getDefaultCells() {
        return [{
                id: 1,
                name: "Eagles Cell",
                leader: "Pastor John Ahmed",
                description: "A cell group focused on spiritual leadership development and mentorship.",
                members: 12,
                meeting: "Tuesday, 7 PM",
                location: "Zone A"
            },
            {
                id: 2,
                name: "Rivers Cell",
                leader: "Pastor Mary Okonkwo",
                description: "Dedicated to worship, intercession and renewal in the Holy Spirit.",
                members: 15,
                meeting: "Wednesday, 6 PM",
                location: "Zone B"
            },
            {
                id: 3,
                name: "Olive Mount Cell",
                leader: "Pastor Samuel Adeleke",
                description: "A cell group emphasizing discipleship and biblical foundation.",
                members: 10,
                meeting: "Thursday, 7 PM",
                location: "Zone C"
            },
            {
                id: 4,
                name: "Star Light Cell",
                leader: "Pastor Grace Adeyemi",
                description: "Youth-focused cell promoting growth, purpose and Christian excellence.",
                members: 18,
                meeting: "Friday, 6:30 PM",
                location: "Zone D"
            },
            {
                id: 5,
                name: "Harvest Field Cell",
                leader: "Pastor David Mensah",
                description: "Community outreach and service-oriented cell group.",
                members: 14,
                meeting: "Saturday, 9 AM",
                location: "Zone E"
            }
        ];
    }

    static saveCells(cells) {
        localStorage.setItem('patersCells', JSON.stringify(cells));
    }

    static getDevotionals() {
        const stored = localStorage.getItem('patersDevotionals');
        if (stored) return JSON.parse(stored);
        return this.getDefaultDevotionals();
    }

    static getDefaultDevotionals() {
        return [{
                id: 1,
                title: "The Power of Faith",
                date: "2025-03-09",
                scripture: "Hebrews 11:1",
                message: "Faith is the substance of things hoped for, the evidence of things not seen. Today, let us examine our faith and trust in God's promises.",
                author: "Man of God"
            },
            {
                id: 2,
                title: "Walking in Love",
                date: "2025-03-08",
                scripture: "1 John 4:7-8",
                message: "Beloved, let us love one another, for love is of God. God is love, and whoever abides in love abides in God.",
                author: "Man of God"
            },
            {
                id: 3,
                title: "Victory Through Christ",
                date: "2025-03-07",
                scripture: "1 Corinthians 15:57",
                message: "But thanks be to God, who gives us the victory through our Lord Jesus Christ. We are more than conquerors.",
                author: "Man of God"
            }
        ];
    }

    static saveDevotionals(devotionals) {
        localStorage.setItem('patersDevotionals', JSON.stringify(devotionals));
    }
}

// Load events on home page
function loadEventsFromStorage() {
    const container = document.getElementById('upcomingEventsHome');
    if (!container) return;

    const events = DataManager.getEvents();
    const upcomingEvents = events.filter(e => e.type === 'upcoming').slice(0, 3);

    container.innerHTML = upcomingEvents.map(event => `
        <div class="event-card">
            <div class="event-date">${formatDate(event.date)}</div>
            <h3>${event.title}</h3>
            <p><i class="fas fa-clock"></i> ${event.time}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p class="event-desc">${event.description}</p>
        </div>
    `).join('');
}

// Load devotionals on home page
function loadDevojialsFromStorage() {
    // This function can be expanded for the home page
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Update navigation active state on scroll
window.addEventListener('scroll', function() {
    setActiveNavLink();
});
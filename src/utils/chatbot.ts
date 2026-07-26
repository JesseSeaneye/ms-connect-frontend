// src/utils/chatbot.ts

export const getResponse = (message: string): string => {
    const text = message.toLowerCase().trim();

    const responses = [
        // --- GREETINGS ---
        {
            keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "sup", "yo"],
            reply: "👋 Hello! How can I assist you with maintenance issues today?"
        },

        // --- PLUMBING ---
        {
            keywords: ["water", "leak", "pipe", "plumbing", "flood", "tap", "faucet", "drip", "dripping", "burst", "pipe burst", "water pressure", "low water", "no water"],
            reply: "💧 This appears to be a plumbing issue. Please report the location and severity. A plumber will be assigned."
        },
        {
            keywords: ["toilet", "flush", "bathroom", "washroom", "urinal", "clogged toilet", "running toilet", "overflow"],
            reply: "🚽 A plumbing technician is required. Please describe the issue in detail (e.g., clogged, overflowing, not flushing)."
        },
        {
            keywords: ["sink", "drain", "blocked", "clogged", "sewer", "drainage", "slow drain", "kitchen sink", "basin"],
            reply: "🔧 A drainage issue has been detected. Maintenance should inspect the pipes. Please report the exact location."
        },
        {
            keywords: ["water heater", "heater", "boiler", "hot water", "geyser", "no hot water", "cold water", "water temperature"],
            reply: "🔥 The water heating system may require maintenance. Check if the power supply is on and report the issue."
        },
        {
            keywords: ["shower", "bath", "bathtub", "shower head", "rain shower", "water flow"],
            reply: "🚿 A plumbing issue with the shower has been noted. Please provide details about the problem."
        },

        // --- ELECTRICAL ---
        {
            keywords: ["electricity", "power", "electrical", "wire", "wiring", "short circuit", "power outage", "blackout", "flickering"],
            reply: "⚡ Please avoid exposed wires and report electrical faults immediately. Do not touch if unsafe."
        },
        {
            keywords: ["socket", "outlet", "switch", "breaker", "fuse", "power point", "extension", "circuit"],
            reply: "🔌 An electrical inspection is required. Please specify which socket or switch is affected."
        },
        {
            keywords: ["light", "bulb", "lighting", "lamp", "led", "tube light", "fluorescent", "chandelier", "ceiling light"],
            reply: "💡 The lighting fixture may require repair or replacement. Please specify the location and type."
        },
        {
            keywords: ["generator", "inverter", "battery", "backup", "genset", "power generator"],
            reply: "🔋 Check the backup power source and verify connections. Report any issues with the generator."
        },
        {
            keywords: ["fan", "ceiling fan", "stand fan", "exhaust fan", "ventilation", "breeze", "air circulation"],
            reply: "🌀 The ventilation system may require inspection. Please describe the fan issue."
        },

        // --- IT / WiFi ---
        {
            keywords: ["wifi", "internet", "network", "router", "connection", "ethernet", "broadband", "data", "signal", "no signal", "weak signal"],
            reply: "🌐 Restart your router and verify connectivity. If the issue persists, report it with your location and device."
        },
        {
            keywords: ["computer", "laptop", "desktop", "pc", "mac", "monitor", "keyboard", "mouse", "printer", "scanner", "screen", "display"],
            reply: "💻 Please contact technical support for equipment-related issues. Provide details about the hardware problem."
        },
        {
            keywords: ["projector", "screen", "conference room", "meeting room", "presentation", "display screen"],
            reply: "📽️ Conference equipment may require technical assistance. Please specify the room number."
        },
        {
            keywords: ["camera", "cctv", "surveillance", "security camera", "motion sensor", "alarm"],
            reply: "📹 Security equipment issues should be reported to technical staff. Please provide the camera location."
        },

        // --- HVAC / AC ---
        {
            keywords: ["ac", "air condition", "air conditioner", "cooling", "hvac", "cool", "heat", "thermostat"],
            reply: "❄️ Check your filters and power supply. Maintenance may be needed for your AC system."
        },
        {
            keywords: ["fan", "ventilation", "vent", "airflow", "air flow", "exhaust"],
            reply: "🌀 The ventilation system may require inspection. Report the location and issue."
        },

        // --- CARPENTRY ---
        {
            keywords: ["door", "gate", "entrance", "exit", "door handle", "door lock", "sliding door", "wooden door"],
            reply: "🚪 Please check for physical obstructions or damaged hinges. A carpenter may be needed."
        },
        {
            keywords: ["lock", "key", "padlock", "security", "deadbolt", "door lock", "window lock", "locker"],
            reply: "🔒 A lock repair or replacement may be required. Please specify the location."
        },
        {
            keywords: ["window", "glass", "frame", "shutter", "window pane", "glass crack", "sliding window"],
            reply: "🪟 Window maintenance may be required. Please report the location and issue."
        },
        {
            keywords: ["chair", "desk", "table", "furniture", "bed", "wardrobe", "cabinet", "shelf", "drawer", "office chair"],
            reply: "🪑 Furniture maintenance has been noted. Please specify the item and problem."
        },
        {
            keywords: ["carpentry", "wood", "wooden", "cabinet", "shelf", "hinge", "handle"],
            reply: "🪚 A carpentry issue has been detected. Please describe the item and problem."
        },

        // --- SANITATION / CLEANING ---
        {
            keywords: ["cleaning", "dirty", "dust", "trash", "waste", "garbage", "litter", "mess", "sanitation", "hygiene"],
            reply: "🧹 Cleaning services may be required. Please specify the area that needs attention."
        },
        {
            keywords: ["pest", "rat", "cockroach", "insect", "ant", "termite", "rodent", "bug", "mice", "spider", "mosquito"],
            reply: "🐜 Pest control services may be needed. Please describe the issue and location."
        },
        {
            keywords: ["garden", "grass", "tree", "landscape", "lawn", "plant", "flower", "bush", "hedge"],
            reply: "🌿 Grounds maintenance should inspect the area. Please specify the location."
        },

        // --- MASONRY / BUILDING ---
        {
            keywords: ["wall", "paint", "crack", "hole", "damage", "plaster", "brick", "concrete", "tile", "grout"],
            reply: "🧱 Building maintenance should inspect the affected area. Please report the location."
        },
        {
            keywords: ["ceiling", "roof", "roofing", "leaking roof", "ceiling leak", "water stain", "plaster damage"],
            reply: "🏠 Roof or ceiling damage should be inspected urgently. Please report the location."
        },
        {
            keywords: ["floor", "tile", "tiles", "carpet", "pavement", "flooring", "wooden floor", "linoleum"],
            reply: "🔨 Flooring issues should be assessed by maintenance staff. Please specify the area."
        },
        {
            keywords: ["masonry", "brickwork", "block", "cement", "plastering", "rendering"],
            reply: "🧱 A masonry issue has been detected. Please describe the location and problem."
        },
        {
            keywords: ["stairs", "staircase", "handrail", "step", "banister", "railing"],
            reply: "🪜 Please report the location for safety inspection. This may require immediate attention."
        },

        // --- EMERGENCY ---
        {
            keywords: ["fire", "smoke", "burning", "flame", "alarm", "fire alarm", "extinguisher", "fire drill"],
            reply: "🔥⚠️ FOLLOW EMERGENCY PROCEDURES IMMEDIATELY. Evacuate the area and contact emergency services."
        },
        {
            keywords: ["emergency", "urgent", "danger", "hazard", "immediate", "critical", "emergency", "serious", "severe"],
            reply: "🚨⚠️ This appears to be urgent. Please notify emergency personnel and report immediately."
        },
        {
            keywords: ["earthquake", "flood", "storm", "lightning", "tornado", "disaster"],
            reply: "🌪️⚠️ Please follow emergency protocols and seek safety immediately. Report after securing safety."
        },

        // --- ELEVATOR ---
        {
            keywords: ["elevator", "lift", "vertical transport"],
            reply: "🛗 Elevator issues require specialized maintenance support. Please report the building and floor."
        },
        {
            keywords: ["escalator", "moving walkway", "stairs"],
            reply: "🛗 Please report the location for safety inspection of the escalator or moving walkway."
        },

        // --- PARKING ---
        {
            keywords: ["parking", "car park", "garage", "parking lot", "parking bay", "car space"],
            reply: "🚗 Parking facility maintenance may be required. Please specify the parking area."
        },

        // --- TECHNICIAN / STAFF ---
        {
            keywords: ["technician", "engineer", "maintenance staff", "repairman", "worker", "handyman", "service", "crew", "maintenance"],
            reply: "👨‍🔧 A technician can be assigned after a report is submitted. Please file a ticket through the app."
        },

        // --- REPORT / TICKET ---
        {
            keywords: ["report", "ticket", "request", "complaint", "issue", "problem", "fault", "complaint", "service request", "work order"],
            reply: "📋 Please provide full details so a maintenance report can be created. Include category and location."
        },

        // --- THANKS ---
        {
            keywords: ["thanks", "thank you", "appreciate", "grateful", "thanks a lot", "thank you so much", "thx"],
            reply: "You're welcome! 😊 Let me know if you need further assistance or want to report a new issue."
        },

        // --- HELP ---
        {
            keywords: ["help", "support", "assistance", "guide", "how to", "instructions", "where to", "what to do"],
            reply: "🆘 I'm here to help! You can ask me about: Plumbing, Electrical, WiFi/IT, Carpentry, Sanitation, AC/Fans, and more. Just tell me your issue."
        },

        // --- GOODBYE ---
        {
            keywords: ["bye", "goodbye", "see you", "later", "adios", "cheers", "ttyl", "farewell"],
            reply: "👋 Goodbye! Don't hesitate to come back if you have any maintenance issues. Have a great day!"
        },
    ];

    for (const item of responses) {
        if (item.keywords.some(keyword => text.includes(keyword))) {
            return item.reply;
        }
    }

    return "🤔 I am a maintenance support chatbot. Please describe your issue in more detail so I can assist you better.\n\n💡 Try using keywords like: plumbing, electrical, WiFi, carpentry, sanitation, AC, or fire emergency.";
};
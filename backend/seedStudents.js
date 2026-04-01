require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

// ── 10 unique students per class (classes 1-10 and 12, skipping 11) ──────────
// studentName is the display name; username is firstname.lastname (no class suffix)
const studentsByClass = {
    "1": [
        { name: "Aarav Sharma", user: "aarav.sharma" },
        { name: "Diya Nair", user: "diya.nair" },
        { name: "Kiran Reddy", user: "kiran.reddy" },
        { name: "Meera Pillai", user: "meera.pillai" },
        { name: "Rohan Verma", user: "rohan.verma" },
        { name: "Sneha Iyer", user: "sneha.iyer" },
        { name: "Tarun Mehta", user: "tarun.mehta" },
        { name: "Usha Krishnan", user: "usha.krishnan" },
        { name: "Vivek Patel", user: "vivek.patel" },
        { name: "Yamini Bose", user: "yamini.bose" },
    ],
    "2": [
        { name: "Aditi Joshi", user: "aditi.joshi" },
        { name: "Bhavesh Kumar", user: "bhavesh.kumar" },
        { name: "Chitra Menon", user: "chitra.menon" },
        { name: "Dinesh Rao", user: "dinesh.rao" },
        { name: "Esha Gupta", user: "esha.gupta" },
        { name: "Farhan Sheikh", user: "farhan.sheikh" },
        { name: "Geetha Subramani", user: "geetha.subramani" },
        { name: "Harish Nambiar", user: "harish.nambiar" },
        { name: "Isha Malhotra", user: "isha.malhotra" },
        { name: "Jagadeesh Murthy", user: "jagadeesh.murthy" },
    ],
    "3": [
        { name: "Kavitha Anand", user: "kavitha.anand" },
        { name: "Lokesh Suresh", user: "lokesh.suresh" },
        { name: "Madhu Balaji", user: "madhu.balaji" },
        { name: "Naveen Shankar", user: "naveen.shankar" },
        { name: "Oviya Natarajan", user: "oviya.natarajan" },
        { name: "Prakash Rajan", user: "prakash.rajan" },
        { name: "Ramya Venkat", user: "ramya.venkat" },
        { name: "Sathish Ganesan", user: "sathish.ganesan" },
        { name: "Thenmozhi Arjun", user: "thenmozhi.arjun" },
        { name: "Uma Sundar", user: "uma.sundar" },
    ],
    "4": [
        { name: "Varsha Pandian", user: "varsha.pandian" },
        { name: "Waqar Ahmed", user: "waqar.ahmed" },
        { name: "Xavier Fernandes", user: "xavier.fernandes" },
        { name: "Yamuna Selvam", user: "yamuna.selvam" },
        { name: "Zara Hussain", user: "zara.hussain" },
        { name: "Ajay Balasubramaniam", user: "ajay.balasubramaniam" },
        { name: "Bindhu Raghavan", user: "bindhu.raghavan" },
        { name: "Chandru Mani", user: "chandru.mani" },
        { name: "Dakshina Moorthy", user: "dakshina.moorthy" },
        { name: "Elango Periyasamy", user: "elango.periyasamy" },
    ],
    "5": [
        { name: "Fathima Begum", user: "fathima.begum" },
        { name: "Gokul Krishnamurthy", user: "gokul.krishnamurthy" },
        { name: "Hema Saravanan", user: "hema.saravanan" },
        { name: "Irfan Qureshi", user: "irfan.qureshi" },
        { name: "Jayashree Muthu", user: "jayashree.muthu" },
        { name: "Kalai Arasu", user: "kalai.arasu" },
        { name: "Lavanya Ramesh", user: "lavanya.ramesh" },
        { name: "Manikandan Pillai", user: "manikandan.pillai" },
        { name: "Nithya Devi", user: "nithya.devi" },
        { name: "Padmavathi Raju", user: "padmavathi.raju" },
    ],
    "6": [
        { name: "Pradeep Velayutham", user: "pradeep.velayutham" },
        { name: "Radha Krishnamoorthy", user: "radha.krishnamoorthy" },
        { name: "Selvakumar Pandi", user: "selvakumar.pandi" },
        { name: "Tamilselvi Gopal", user: "tamilselvi.gopal" },
        { name: "Umayal Muthusamy", user: "umayal.muthusamy" },
        { name: "Vasanth Kumaran", user: "vasanth.kumaran" },
        { name: "Vijayalakshmi Subramaniam", user: "vijayalakshmi.subramaniam" },
        { name: "Wazir Khan", user: "wazir.khan" },
        { name: "Yuvaraj Murugan", user: "yuvaraj.murugan" },
        { name: "Zainab Begum", user: "zainab.begum" },
    ],
    "7": [
        { name: "Abinaya Chandramohan", user: "abinaya.chandramohan" },
        { name: "Balamurugan Raj", user: "balamurugan.raj" },
        { name: "Chandra Sekar", user: "chandra.sekar" },
        { name: "Dhanasekaran Vel", user: "dhanasekaran.vel" },
        { name: "Elavarasi Mani", user: "elavarasi.mani" },
        { name: "Gnanavelu Palanisamy", user: "gnanavelu.palanisamy" },
        { name: "Hemalatha Rajendran", user: "hemalatha.rajendran" },
        { name: "Ilayaraja Thangavel", user: "ilayaraja.thangavel" },
        { name: "Jegadeesan Murugesan", user: "jegadeesan.murugesan" },
        { name: "Kamalam Sundaram", user: "kamalam.sundaram" },
    ],
    "8": [
        { name: "Lakshmanan Parthasarathy", user: "lakshmanan.parthasarathy" },
        { name: "Malathi Venkatesan", user: "malathi.venkatesan" },
        { name: "Nagarajan Thangaraj", user: "nagarajan.thangaraj" },
        { name: "Omsakthi Manickam", user: "omsakthi.manickam" },
        { name: "Parvathi Natesan", user: "parvathi.natesan" },
        { name: "Raghavendran Suresh", user: "raghavendran.suresh" },
        { name: "Saradha Kumari", user: "saradha.kumari" },
        { name: "Thulasidoss Perumal", user: "thulasidoss.perumal" },
        { name: "Uthayakumar Sivan", user: "uthayakumar.sivan" },
        { name: "Vetri Selvan", user: "vetri.selvan" },
    ],
    "9": [
        { name: "Anand Babu", user: "anand.babu" },
        { name: "Brindha Srinivasan", user: "brindha.srinivasan" },
        { name: "Chellappan Govindaraj", user: "chellappan.govindaraj" },
        { name: "Dhivya Priya", user: "dhivya.priya" },
        { name: "Ezhumalai Kannan", user: "ezhumalai.kannan" },
        { name: "Gomathi Sundaresan", user: "gomathi.sundaresan" },
        { name: "Hari Haran", user: "hari.haran" },
        { name: "Indhuja Rathnam", user: "indhuja.rathnam" },
        { name: "Jothika Pandiarajan", user: "jothika.pandiarajan" },
        { name: "Karunamoorthy Das", user: "karunamoorthy.das" },
    ],
    "10": [
        { name: "Lalitha Velu", user: "lalitha.velu" },
        { name: "Manimaran Palani", user: "manimaran.palani" },
        { name: "Nandhini Kandasamy", user: "nandhini.kandasamy" },
        { name: "Pandiyarajan Ayyasamy", user: "pandiyarajan.ayyasamy" },
        { name: "Rani Parasuraman", user: "rani.parasuraman" },
        { name: "Suresh Kanagavel", user: "suresh.kanagavel" },
        { name: "Tharani Krishnaswamy", user: "tharani.krishnaswamy" },
        { name: "Umadevi Ramasamy", user: "umadevi.ramasamy" },
        { name: "Venkatesan Arumugam", user: "venkatesan.arumugam" },
        { name: "Yazhini Kathiravan", user: "yazhini.kathiravan" },
    ],
    "12": [
        { name: "Akilandeswari Baskaran", user: "akilandeswari.baskaran" },
        { name: "Balamurali Krishnan", user: "balamurali.krishnan" },
        { name: "Chidambaram Pillai", user: "chidambaram.pillai" },
        { name: "Devadoss Subramanian", user: "devadoss.subramanian" },
        { name: "Esakkimuthu Raja", user: "esakkimuthu.raja" },
        { name: "Geetha Lakshmi", user: "geetha.lakshmi" },
        { name: "Hariharan Seshadri", user: "hariharan.seshadri" },
        { name: "Ilaiyarasan Nandakumar", user: "ilaiyarasan.nandakumar" },
        { name: "Jayaraman Sethupathi", user: "jayaraman.sethupathi" },
        { name: "Krishnaveni Annamalai", user: "krishnaveni.annamalai" },
    ],
};

// Usernames that were created by the previous seed (name_classN pattern) to clean up
const OLD_NAME_ROOTS = [
    "abinithi", "annapoorani", "bharathi", "chithra",
    "deepa", "ezhil", "farooq", "ganesh", "hari", "indhu"
];
const OLD_CLASS_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // ── Step 1: Remove old _classN style entries ──────────────────────────
        const oldUsernames = OLD_CLASS_NUMS.flatMap(c =>
            OLD_NAME_ROOTS.map(n => `${n}_${c}`)
        );
        const del = await User.deleteMany({ username: { $in: oldUsernames } });
        console.log(`Removed ${del.deletedCount} old _classN-style student records.`);

        // ── Step 2: Insert proper uniquely named students ─────────────────────
        let created = 0, skipped = 0;
        for (const [cls, students] of Object.entries(studentsByClass)) {
            for (const s of students) {
                const exists = await User.findOne({ username: s.user });
                if (!exists) {
                    await new User({
                        username: s.user,
                        password: "pass123",
                        role: "student",
                        studentName: s.name,
                        className: cls,
                    }).save();
                    console.log(`  ✓ Class ${cls.padStart(2)} | ${s.name} (${s.user})`);
                    created++;
                } else {
                    console.log(`  – Exists: ${s.user}`);
                    skipped++;
                }
            }
        }

        console.log(`\nDone! Created ${created} students, skipped ${skipped} existing.`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seed();

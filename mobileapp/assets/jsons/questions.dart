Map<String, dynamic> dropDown1 = {
  "title": "Do You Have Brown Patches in Your Lawn?",
  "questions": [
    {
      "id": "Q1",
      "question": "Are the brown patches circular or have a distinct pattern?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, the patches are irregular in shape", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Do the patches have a darker, water-soaked or smoky ring around the edges?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Brown Patch Disease (Rhizoctonia)",
          "details": [
            "Brown Patch thrives in warm, humid conditions, usually in summer.",
            "The patches can be a few inches to several feet wide.",
            "The affected grass blades look water-soaked or tan with a dark border."
          ],
          "solution":
              "Apply a fungicide like Scotts DiseaseEx and reduce evening watering.",
          "link": "Affiliate Link: Scotts DiseaseEx Fungicide",
          "affiliate_link" : "https://amzn.to/42xX7gx"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Are the patches small (1-3 inches in diameter) and look like silver-dollar-sized spots?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Dollar Spot Disease",
          "details": [
            "More common in lawns that are low in nitrogen.",
            "Can spread quickly in humid weather, especially in the morning when there’s dew and the soil is on the drier side."
          ],
          "solution": "Apply a fungicide and a light nitrogen fertilizer.",
          "link": "Affiliate Link: Fungicide & Nitrogen Fertilizer",
          "affiliate_link" : " https://amzn.to/42uixuU & https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Do the patches have thin, reddish-brown threads or webbing on the grass blades?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Red Thread Disease",
          "details": [
            "Common in nitrogen-deficient lawns.",
            "The grass may not be dying, just discolored."
          ],
          "solution":
              "Apply a nitrogen fertilizer and improve soil health. No fungicide necessary.",
          "link": "Affiliate Link: Lawn Fertilizer for Red Thread",
          "affiliate_link" : "https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question":
          "Does the grass easily pull up from the affected area, like it has no roots?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Grub Damage (pest infestation)",
          "details": [
            "Grubs feed on grassroots, making the lawn easy to lift like a carpet."
          ],
          "solution":
              "Apply a grub control treatment like BioAdvanced Grub Killer.",
          "link": "Affiliate Link: BioAdvanced Grub Killer",
          "affiliate_link" : "https://amzn.to/3RygNKT"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question": "Is the soil very soft, spongy, or does it smell bad?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pythium Blight",
          "details": ["A severe water-related fungus."],
          "solution":
              "Improve lawn drainage, reduce watering, and apply a fungicide.",
          "link": "Affiliate Link: Fungicide for Pythium Blight",
           "affiliate_link" : "https://amzn.to/42zTEhy"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Do the brown patches appear after mowing, or does your lawn look scalped?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mowing Stress or Dull Mower Blades",
          "solution": "Raise your mower height and sharpen the blades.",
          "link": "Affiliate Link: Lawn Mower Blade Sharpener",
           "affiliate_link" : " https://amzn.to/3YPzDkq"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Do the patches appear in areas where pets frequently urinate?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pet Urine Damage",
          "solution":
              "Water the area immediately after your pet urinates. Apply a soil conditioner to neutralize salts such as gypsum.",
          "link": "Affiliate Link: Soil Conditioner for Pet Urine Spots",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q9"}
      ]
    },
    {
      "id": "Q9",
      "question":
          "Are the patches mainly in sunny areas, appearing during hot weather?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Heat Stress or Drought Damage",
          "solution":
              "Deep water in the morning, apply a moisture-retaining soil conditioner, and avoid mowing during heat waves.",
          "link": "Affiliate Link: Lawn Moisture Retention Product",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q10"}
      ]
    },
    {
      "id": "Q10",
      "question": "Is the affected area in the shade or under a tree?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Shade Stress or Root Competition from Trees",
          "solution":
              "Overseed with shade-tolerant grass seed and trim tree branches to allow more sunlight.",
          "link": "Affiliate Link: Shade Grass Seed",
           "affiliate_link" : " https://amzn.to/42x6XiL,"
        },
        {
          "text": "No",
          "diagnosis": "Soil Issue (Compaction or Nutrient Deficiency)",
          "solution": "Aerate the soil and apply a balanced fertilizer.",
          "link": "Affiliate Link: Lawn Aerator & Fertilizer",
           "affiliate_link" : "https://amzn.to/4izeL88 & https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    }
  ]
};

Map<String, dynamic> dropDown2 = {
  "title": "Do You Have Yellowing Grass?",
  "questions": [
    {
      "id": "Q1",
      "question": "Is the yellowing uniform across the entire lawn?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it's in patches or streaks", "next": "Q6"}
      ]
    },
    {
      "id": "Q2",
      "question": "Has the lawn been fertilized recently?",
      "answers": [
        {"text": "Yes, within the last 2 weeks", "next": "Q3"},
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q3",
      "question": "Did the yellowing appear shortly after fertilizing?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fertilizer Burn (Over-fertilization)",
          "details": [
            "Too much nitrogen can scorch the grass, turning it yellow or brown."
          ],
          "solution":
              "Deep water the area for several days to flush out excess nitrogen. If severe, apply a soil conditioner to help recover.",
          "link": "Affiliate Link: Soil Conditioner for Fertilizer Burn",
           "affiliate_link" : "https://amzn.to/42u4aGX"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Is the lawn receiving enough water (at least 1 inch per week)?",
      "answers": [
        {"text": "Yes", "next": "Q5"},
        {
          "text": "No",
          "diagnosis": "Drought Stress",
          "details": [
            "Grass turns yellow before turning brown when it lacks water."
          ],
          "solution":
              "Deep water in the morning 2–3 times per week rather than shallow daily watering. Use a moisture-retaining soil additive.",
          "link": "Affiliate Link: Lawn Moisture Retention Product",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Are the lower grass blades turning yellow first, while the top remains green?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Nitrogen Deficiency",
          "details": [
            "Grass loses its deep green color when lacking nitrogen, starting from the lower leaves."
          ],
          "solution": "Apply a slow-release nitrogen fertilizer.",
          "link": "Affiliate Link: Slow-Release Lawn Fertilizer",
           "affiliate_link" : "https://amzn.to/4cPbOPH"
        },
        {
          "text": "No",
          "diagnosis": "Iron or Magnesium Deficiency",
          "solution": "Apply iron supplement or micronutrient fertilizer.",
          "link": "Affiliate Link: Lawn Iron Supplement",
           "affiliate_link" : "https://amzn.to/431yuZA"
        }
      ]
    },
    {
      "id": "Q6",
      "question": "Are the yellow patches appearing in streaks or lines?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mowing or Fertilizer Application Issue",
          "details": [
            "Streaky yellowing can happen when fertilizer is applied unevenly or mower blades are dull."
          ],
          "solution":
              "Sharpen mower blades & use a spread calibrator for even fertilizer application.",
          "link":
              "Affiliate Link: Lawn Mower Blade Sharpener & Spreader Calibrator",
               "affiliate_link" : "https://amzn.to/42LTWAz"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Do the yellow patches have a reddish tint or powdery texture?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Rust Disease (Fungus)",
          "details": [
            "Common in low nitrogen lawns, it produces orange or rust-colored spores on grass blades."
          ],
          "solution": "Apply nitrogen fertilizer and improve air circulation.",
          "link": "Affiliate Link: Lawn Fungicide & Nitrogen Fertilizer",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1994749&u=3538080&m=43235&urllink=&afftrack= & https://amzn.to/44bijKs"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question": "Do the yellowing areas feel soft and waterlogged?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Overwatering or Fungal Disease (e.g., Pythium Blight)",
          "solution":
              "Reduce watering, improve drainage, and apply a fungicide.",
          "link": "Affiliate Link: Lawn Fungicide for Overwatering Issues",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1994749&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q9"}
      ]
    },
    {
      "id": "Q9",
      "question": "Are the yellow patches appearing near pet urine spots?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pet Urine Damage",
          "details": [
            "High nitrogen in dog urine causes yellowing with dark green edges."
          ],
          "solution":
              "Water the area immediately after urination & apply a soil neutralizer.",
          "link": "Affiliate Link: Pet Urine Soil Neutralizer",
           "affiliate_link" : "https://amzn.to/3YkzKo9"
        },
        {"text": "No", "next": "Q10"}
      ]
    },
    {
      "id": "Q10",
      "question": "Are the yellow areas near sidewalks, driveways, or streets?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Heat Stress or Salt Buildup",
          "details": [
            "Caused by reflected sunlight or de-icing salt in winter."
          ],
          "solution":
              "Apply gypsum to neutralize salt & deep water the area to flush salts.",
          "link": "Affiliate Link: Gypsum Soil Treatment",
           "affiliate_link" : "https://amzn.to/3YkzKo9"
        },
        {
          "text": "No",
          "diagnosis": "Compacted Soil",
          "solution": "Aerate the soil and apply a balanced lawn fertilizer.",
          "link": "Affiliate Link: Lawn Aerator & Fertilizer",
           "affiliate_link" : " https://amzn.to/3S8eHBy○ & https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    }
  ]
};

Map<String, dynamic> dropDown3 = {
  "title": "Are There Thinning or Bare Spots in Your Lawn?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Are the thin or bare spots appearing in large, random areas across the lawn?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {
          "text": "No, the thinning is concentrated in specific areas",
          "next": "Q5"
        }
      ]
    },
    {
      "id": "Q2",
      "question": "Have you recently applied fertilizer or weed killer?",
      "answers": [
        {"text": "Yes", "next": "Q3"},
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q3",
      "question": "Did the thinning appear after applying a weed killer?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Herbicide Damage",
          "details": [
            "Some weed killers can stress or kill grass if over-applied or applied in hot weather."
          ],
          "solution":
              "Water deeply to flush chemicals and overseed damaged areas.",
          "link": "Affiliate Link: Lawn Repair Seed & Soil Conditioner",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=2625473&u=3538080&m=43235&urllink=&afftrack= & https://amzn.to/3YKjf4H"
        },
        {
          "text": "No",
          "diagnosis": "Fertilizer Burn",
          "details": [
            "Excessive nitrogen can damage roots, especially in hot or dry weather."
          ],
          "solution":
              "Deep water the area and apply a soil neutralizer if needed.",
          "link": "Affiliate Link: Soil Conditioner for Burn Recovery",
           "affiliate_link" : "https://amzn.to/3YKjf4H"
        }
      ]
    },
    {
      "id": "Q4",
      "question":
          "Is the thinning widespread but the grass still growing, just weak and sparse?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Nutrient Deficiency or Compacted Soil",
          "solution":
              "Apply a balanced lawn fertilizer and aerate compacted soil.",
          "link": "Affiliate Link: Lawn Aerator & Fertilizer",
           "affiliate_link" : " https://amzn.to/3RDJ1UC & https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis": "Possible Pest or Disease Issues",
          "solution":
              "Inspect roots for pests (grubs) or signs of fungal infection.",
          "link": "Affiliate Link: Lawn Pest Control & Fungicide",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1994774&u=3538080&m=43235&urllink=&afftrack= & https://shareasale.com/r.cfm?b=1994749&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    },
    {
      "id": "Q5",
      "question": "Are the thinning spots near trees or shaded areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Shade Stress or Tree Root Competition",
          "details": [
            "Tree roots compete for nutrients and water, causing thinning."
          ],
          "solution":
              "Overseed with shade-tolerant grass seed and prune low-hanging branches.",
          "link": "Affiliate Link: Shade-Tolerant Grass Seed",
           "affiliate_link" : "https://amzn.to/4iwDERR"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question": "Do the thin spots feel soft, mushy, or appear waterlogged?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Overwatering or Fungal Disease",
          "solution":
              "Reduce watering, improve drainage, and apply a fungicide.",
          "link": "Affiliate Link: Lawn Fungicide for Overwatering Issues",
           "affiliate_link" : "https://amzn.to/4jAR6G0"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question": "Do the thinning areas pull up easily like sod?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Grub Infestation",
          "details": [
            "Grubs eat the roots, causing grass to detach easily from the soil."
          ],
          "solution":
              "Apply a grub control treatment like BioAdvanced Grub Killer.",
          "link": "Affiliate Link: Grub Control Treatment",
           "affiliate_link" : "https://amzn.to/4jlvYTQ"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Are there small tunnels or mounds of dirt in the thinning areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mole or Vole Activity",
          "solution": "Use mole/vole repellents or traps to deter pests.",
          "link": "Affiliate Link: Mole & Vole Repellent",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1657319&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q9"}
      ]
    },
    {
      "id": "Q9",
      "question": "Has the lawn been recently dethatched or aerated?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Temporary Stress from Mechanical Damage",
          "solution": "Lightly fertilize and water to help recovery.",
          "link": "Affiliate Link: Lawn Recovery Fertilizer",
           "affiliate_link" : "https://amzn.to/3Erjr2b"
        },
        {"text": "No", "next": "Q10"}
      ]
    },
    {
      "id": "Q10",
      "question":
          "Have you noticed animals like birds, skunks, or raccoons digging in the lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pests (Grubs or Insects) Attracting Predators",
          "solution": "Apply grub or insect control and use animal repellents.",
          "link": "Affiliate Link: Lawn Pest & Animal Repellent",
           "affiliate_link" : "https://shareasale.com/r.cfm?b=1657319&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis": "Compacted or Nutrient-Poor Soil",
          "solution": "Aerate and fertilize to encourage new growth.",
          "link": "Affiliate Link: Lawn Aerator & Organic Fertilizer",
           "affiliate_link" : "https://amzn.to/3YKjPiT & https://shareasale.com/r.cfm?b=964298&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    }
  ]
};

Map<String, dynamic> dropDown4 = {
  "title": "Is Grass Pulling Up Easily (Weak Roots)?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "When you pull on the grass, does it come up in large, loose chunks like sod?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it stays mostly intact but looks weak", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Do you see white, C-shaped larvae (grubs) in the soil under the grass?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Grub Infestation",
          "details": [
            "Grubs feed on the roots, causing the grass to detach easily."
          ],
          "solution":
              "Apply a grub control treatment like BioAdvanced Grub Killer. Water deeply after application.",
          "link": "Affiliate Link: BioAdvanced Grub Killer",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=964298&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Do you see tunnels or raised ridges under the grass?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Moles or Voles",
          "solution":
              "Use mole/vole repellents or traps to prevent further damage.",
          "link": "Affiliate Link: Mole & Vole Repellent",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=414281&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question": "Is the soil extremely dry, hard, or compacted?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Compacted Soil",
          "solution":
              "Aerate the lawn and apply a soil conditioner to improve root development.",
          "link": "Affiliate Link: Lawn Aerator & Soil Conditioner",
          "affiliate_link":
              "https://amzn.to/3GsXeBq;https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis": "Root Rot from Overwatering",
          "solution":
              "Reduce watering frequency and improve drainage. Apply fungicide if needed.",
          "link": "Affiliate Link: Lawn Fungicide for Root Rot",
          "affiliate_link": "https://amzn.to/4334lcu"
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Is the grass thin and weak, but not detaching from the soil?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Nutrient Deficiency or Poor Soil Health",
          "solution":
              "Apply a balanced fertilizer with phosphorus to promote root growth.",
          "link": "Affiliate Link: Root-Boosting Fertilizer",
          "affiliate_link": "https://amzn.to/3EF9Yo0"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Does the grass have a reddish or rust-colored dust when you run your hand over it?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Rust Disease",
          "solution": "Apply nitrogen fertilizer and a fungicide.",
          "link": "Affiliate Link: Lawn Fungicide & Nitrogen Fertilizer",
          "affiliate_link":
              "https://amzn.to/42xnTFN;https://amzn.to/3EGsBI0"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Does the grass struggle to recover after mowing or foot traffic?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Drought Stress or Shallow Roots",
          "solution":
              "Water deeply and less frequently to encourage deeper roots.",
          "link": "Affiliate Link: Moisture Retention Soil Conditioner",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Have you noticed an excessive thatch layer (spongy buildup between grass and soil)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Thatch Buildup",
          "solution":
              "Dethatch the lawn using a thatch rake or power dethatcher.",
          "link": "Affiliate Link: Lawn Dethatcher Tool",
          "affiliate_link": "https://amzn.to/4jw4vPv"
        },
        {
          "text": "No",
          "diagnosis": "Chemical Damage",
          "solution":
              "Flush the soil with deep watering and apply a soil recovery product.",
          "link": "Affiliate Link: Soil Conditioner for Recovery",
          "affiliate_link": "https://amzn.to/3YhwkT9"
        }
      ]
    }
  ]
};


Map<String, dynamic> dropDown5 = {
  "title": "Is Your Lawn Mushy or Waterlogged?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Is the grass constantly wet, even when it hasn't rained recently?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it only happens after rain or watering", "next": "Q4"}
      ]
    },
    {
      "id": "Q2",
      "question": "Does water pool in low spots or certain areas of your lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Poor drainage or compacted soil",
          "details": [
            "Water sits on the surface because the soil is too compacted to absorb it."
          ],
          "solution":
              "Aerate the lawn and add organic matter or sand to improve drainage. Consider installing French drains if necessary.",
          "link": "Affiliate Link: Lawn Aerator & Drainage Sand",
          "affiliate_link":
              "https://amzn.to/3GsXeBq;https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Does the grass have a slimy or moldy appearance?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Algae or Slime Mold",
          "solution":
              "Reduce watering, rake affected areas, and apply a soil conditioner to improve drainage.",
          "link": "Affiliate Link: Lawn Soil Conditioner for Drainage",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis": "Fungal Disease from Excess Moisture",
          "solution": "Apply a fungicide and adjust watering practices.",
          "link": "Affiliate Link: Lawn Fungicide for Wet Conditions",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994749&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    },
    {
      "id": "Q4",
      "question": "Does the lawn turn mushy only after heavy rain or watering?",
      "answers": [
        {"text": "Yes", "next": "Q5"},
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q5",
      "question":
          "Does the water drain within a few hours, or does it linger for a long time?",
      "answers": [
        {
          "text": "Drains within a few hours",
          "diagnosis": "Temporary saturation",
          "solution":
              "Allow the lawn to dry before watering again. Mow at a higher setting to avoid scalping wet grass."
        },
        {
          "text": "Lingers for a long time",
          "diagnosis": "Clay-heavy soil",
          "solution": "Apply gypsum to break up clay and improve drainage.",
          "link": "Affiliate Link: Gypsum Soil Conditioner",
          "affiliate_link": "https://amzn.to/3GtU3Jz"
        }
      ]
    },
    {
      "id": "Q6",
      "question":
          "Do the grass blades appear yellow or wilted despite the wet conditions?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Root Rot or Fungal Infection",
          "solution":
              "Apply a fungicide and improve drainage. Avoid watering in the evening.",
          "link": "Affiliate Link: Lawn Fungicide for Root Rot",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994749&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are there mushrooms or other fungal growths in the affected areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Organic Matter Decomposing",
          "solution":
              "Remove mushrooms manually and aerate the lawn. Improve air circulation by mowing regularly.",
          "link": "Affiliate Link: Lawn Aerator & Decomposition Control",
          "affiliate_link": "https://amzn.to/44hoqNr"
        },
        {
          "text": "No",
          "diagnosis": "Excess Thatch Holding Moisture",
          "solution": "Dethatch the lawn using a power rake or thatching tool.",
          "link": "Affiliate Link: Lawn Dethatcher Tool",
          "affiliate_link": "https://amzn.to/44K2LNP"
        }
      ]
    }
  ]
};


Map<String, dynamic> dropDown6 = {
  "title": "Is Your Lawn Dying in Circular Patterns?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Are the circular dead spots surrounded by a darker ring or have a 'smoky' outer edge?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {
          "text": "No, the circles are solid, without a distinct ring",
          "next": "Q4"
        }
      ]
    },
    {
      "id": "Q2",
      "question": "Do the affected areas appear during warm, humid conditions?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Brown Patch Disease (Rhizoctonia solani)",
          "details": [
            "Common in cool-season grasses during hot, humid weather.",
            "Patches can be several inches to several feet wide."
          ],
          "solution":
              "Apply a fungicide and avoid watering in the evening. Reduce nitrogen if excessive.",
          "link": "Affiliate Link: Lawn Fungicide for Brown Patch",
          "affiliate_link": "https://amzn.to/4lLqXWa"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Do the patches start small and gradually expand outward?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Dollar Spot Disease",
          "details": [
            "Caused by nitrogen deficiency.",
            "Starts as silver-dollar-sized spots that merge over time."
          ],
          "solution": "Apply a fungicide and a balanced nitrogen fertilizer.",
          "link": "Affiliate Link: Fungicide & Nitrogen Fertilizer",
          "affiliate_link":
              "https://amzn.to/4kbFNnB;https://amzn.to/42LVwlZ"
        },
        {
          "text": "No",
          "diagnosis": "Fusarium Patch",
          "solution":
              "Apply a fungicide and improve drainage. Avoid excessive nitrogen in fall.",
          "link": "Affiliate Link: Lawn Fungicide for Fusarium Patch",
          "affiliate_link": "https://amzn.to/4kbFNnB"
        }
      ]
    },
    {
      "id": "Q4",
      "question":
          "Do the dead circles have grass growing in the center, resembling a 'frog eye' pattern?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Necrotic Ring Spot (NRS)",
          "details": ["Soil-borne fungus common in Kentucky Bluegrass."],
          "solution":
              "Overseed with resistant grass varieties and apply fungicide.",
          "link": "Affiliate Link: Lawn Fungicide for Necrotic Ring Spot",
          "affiliate_link": "https://amzn.to/42tB4rc"
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question": "Are the circles accompanied by mushrooms or fungal growth?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fairy Ring",
          "details": [
            "Soil fungus feeding on decaying matter. May have a lush green ring or mushrooms."
          ],
          "solution":
              "Aerate deeply, remove thatch, and apply a wetting agent to break down fungal buildup.",
          "link": "Affiliate Link: Fairy Ring Treatment & Lawn Aerator",
          "affiliate_link":
              "https://amzn.to/4485u3z;https://amzn.to/4jLWIgJ"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Do the patches feel spongy and does the grass pull up easily?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Grub Damage",
          "solution":
              "Apply grub control treatment like BioAdvanced Grub Killer.",
          "link": "Affiliate Link: Lawn Grub Killer Treatment",
          "affiliate_link": "https://amzn.to/3RBk7EX"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the circles appearing in dry, compacted areas of the lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Localized Dry Spots (Hydrophobic Soil)",
          "solution":
              "Apply a wetting agent or organic matter to improve soil water retention.",
          "link": "Affiliate Link: Lawn Wetting Agent",
          "affiliate_link": "https://amzn.to/4m6GUGX"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Have you recently applied a chemical or fertilizer in the area?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Chemical Burn or Fertilizer Spill",
          "solution":
              "Deep water the area to dilute salts and apply a soil neutralizer.",
          "link": "Affiliate Link: Soil Conditioner for Fertilizer Burn",
          "affiliate_link": "https://amzn.to/3GqPBLH"
        },
        {
          "text": "No",
          "diagnosis": "Pet Urine or Animal Activity",
          "solution":
              "Flush with water immediately after pet urination and apply a soil amendment.",
          "link": "Affiliate Link: Pet Urine Neutralizer",
          "affiliate_link": "https://amzn.to/4iBzatu"
        }
      ]
    }
  ]
};


Map<String, dynamic> dropDown7 = {
  "title": "Do you Have Dry, Straw-Like Grass?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Does the dry, straw-like grass appear throughout the entire lawn?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it appears in specific areas", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Is the grass turning straw-colored after extreme heat or drought?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Heat Stress or Dormancy",
          "details": [
            "Grass goes into dormancy in high heat to conserve water."
          ],
          "solution":
              "Deep water in the morning (1 inch per week, 2–3x per week) and avoid mowing too short.",
          "link": "Affiliate Link: Lawn Moisture Retention Product",
          "affiliate_link": "https://amzn.to/4iBzatu"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Has the lawn been mowed very short (scalped)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mowing Stress",
          "solution":
              "Raise the mower height to at least 3 inches and sharpen blades.",
          "link": "Affiliate Link: Lawn Mower Blade Sharpener",
          "affiliate_link": "https://amzn.to/3S6oh7U"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question": "Has the lawn been fertilized within the past two weeks?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fertilizer Burn",
          "solution":
              "Deep water the area to dilute excess nitrogen and apply a soil neutralizer.",
          "link": "Affiliate Link: Soil Conditioner for Fertilizer Burn",
          "affiliate_link": "https://amzn.to/4iBzatu"
        },
        {
          "text": "No",
          "diagnosis": "Nutrient Deficiency",
          "solution":
              "Apply a balanced fertilizer with potassium to strengthen grass.",
          "link": "Affiliate Link: Lawn Fertilizer with Potassium",
          "affiliate_link": "https://amzn.to/4jRd8Uz"
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Does the dry, straw-like grass appear in high-traffic areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Soil Compaction",
          "solution":
              "Aerate the lawn and apply organic matter to improve soil structure.",
          "link": "Affiliate Link: Lawn Aerator & Soil Improver",
          "affiliate_link": "https://amzn.to/3RydV0B"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question": "Does the dry grass appear near pet urine spots?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pet Urine Damage",
          "solution":
              "Flush the area with water and apply a pet urine neutralizer.",
          "link": "Affiliate Link: Pet Urine Lawn Neutralizer",
          "affiliate_link": "https://amzn.to/4iBzatu"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question": "Does the dry grass pull up easily, like it has no roots?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Grub Damage",
          "solution":
              "Apply grub control treatment like BioAdvanced Grub Killer.",
          "link": "Affiliate Link: Lawn Grub Killer Treatment",
          "affiliate_link": "https://amzn.to/3EHsD2r"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Does the lawn look patchy, with some green areas and some straw-like areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Disease Stress (e.g., Dollar Spot or Fusarium Patch)",
          "solution": "Apply a fungicide and a light nitrogen boost.",
          "link": "Affiliate Link: Lawn Fungicide & Fertilizer",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994749&u=3538080&m=43235&urllink=&afftrack=;https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q9"}
      ]
    },
    {
      "id": "Q9",
      "question": "Are the dry patches forming in shaded areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Shade Stress",
          "solution":
              "Overseed with shade-tolerant grass and prune trees to allow more light.",
          "link": "Affiliate Link: Shade-Tolerant Grass Seed",
          "affiliate_link": "https://amzn.to/4jnr7By"
        },
        {"text": "No", "next": "Q10"}
      ]
    },
    {
      "id": "Q10",
      "question":
          "Does the lawn have an excessive thatch layer (spongy buildup between soil and grass)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Thatch Buildup",
          "solution": "Dethatch the lawn using a power rake or thatch rake.",
          "link": "Affiliate Link: Lawn Dethatcher Tool",
          "affiliate_link": "https://amzn.to/3GtElOC"
        },
        {
          "text": "No",
          "diagnosis": "Dry & Compacted Soil",
          "solution":
              "Aerate the soil and apply a soil wetting agent to improve moisture absorption.",
          "link": "Affiliate Link: Soil Wetting Agent & Lawn Aerator",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack=;https://amzn.to/3GsXeBq"
        }
      ]
    }
  ]
};


Map<String, dynamic> dropDown8 = {
  "title":
      "Are there Dark Green Patches Surrounded by Lighter Grass in your Lawn?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Do the dark green patches appear in small, irregular shapes?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, they are larger or form a pattern", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question": "Are the dark green patches appearing near pet urine spots?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pet Urine Damage (Excess Nitrogen)",
          "details": [
            "The high nitrogen concentration in pet urine causes dark green, fast-growing patches, often surrounded by yellow or brown edges."
          ],
          "solution":
              "Water the area immediately after urination to dilute nitrogen. Apply a soil neutralizer if needed.",
          "link": "Affiliate Link: Pet Urine Lawn Neutralizer",
          "affiliate_link": "https://amzn.to/3GuJl5F"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Are the dark green patches growing faster than the rest of the lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fertilizer Spill or Uneven Application",
          "details": [
            "Over-fertilized areas grow darker and faster than the rest of the lawn."
          ],
          "solution":
              "Lightly water the area to distribute nutrients more evenly. Use a lawn spreader for uniform fertilizer application in the future.",
          "link": "Affiliate Link: Lawn Spreader for Even Fertilization",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=2583073&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Are the dark green patches appearing in compacted areas or along walkways/driveways?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Soil Compaction",
          "solution":
              "Aerate the compacted areas and apply organic matter to balance soil nutrients.",
          "link": "Affiliate Link: Lawn Aerator & Soil Improver",
          "affiliate_link": "https://amzn.to/3GngFvd"
        },
        {
          "text": "No",
          "diagnosis": "Localized Excess Moisture",
          "solution": "Reduce watering and check for drainage issues.",
          "link": "Affiliate Link: Lawn Drainage Improvement Tools",
          "affiliate_link": "https://amzn.to/3GngFvd"
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Do the dark green patches appear in a circular or ring shape?",
      "answers": [
        {"text": "Yes", "next": "Q6"},
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q6",
      "question": "Do the circles have mushrooms or a ring of darker grass?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fairy Ring (Soil Fungus)",
          "details": [
            "Some Fairy Rings cause dark green, fast-growing grass due to fungal activity in the soil."
          ],
          "solution":
              "Aerate deeply and apply a wetting agent to help nutrients reach the soil.",
          "link": "Affiliate Link: Fairy Ring Treatment & Lawn Aerator",
          "affiliate_link":
              "https://amzn.to/3GngFvd;https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis": "Necrotic Ring Spot or Summer Patch (Fungal Disease)",
          "solution":
              "Apply a fungicide and overseed with disease-resistant grass.",
          "link": "Affiliate Link: Lawn Fungicide for Necrotic Ring Spot",
          "affiliate_link": "https://amzn.to/42POhcS"
        }
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the dark green patches appearing near objects, like under a tree, next to a wall, or near a structure?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Microclimate Effects",
          "details": [
            "Shading, heat retention, or root competition can cause irregular growth and coloration."
          ],
          "solution":
              "Adjust watering to accommodate shade differences or apply shade-tolerant grass seed.",
          "link": "Affiliate Link: Shade-Tolerant Grass Seed",
          "affiliate_link": "https://amzn.to/3GrStrP"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Have the dark green patches appeared after dethatching or aerating?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Improved Soil Conditions",
          "details": [
            "Increased oxygen and nutrient availability in recently aerated areas can enhance grass color and growth."
          ],
          "solution":
              "Continue aerating annually to improve lawn health overall.",
          // no affiliate link needed
          "affiliate_link": ""
        },
        {
          "text": "No",
          "diagnosis": "Nutrient Imbalance",
          "solution":
              "Apply a soil test kit to determine deficiencies and correct them with proper fertilization.",
          "link": "Affiliate Link: Soil Test Kit & Lawn Fertilizer",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1857254&u=3538080&m=115833&urllink=&afftrack=;https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    }
  ]
};

Map<String, dynamic> dropDown9 = {
  "title": "Do You Have Rust-Colored Dust on Grass?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Does the rust-colored dust come off when you rub the grass blades?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, the grass is discolored but no dust rubs off", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Is the discoloration spreading across the lawn, especially in shaded or stressed areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Rust Disease (Puccinia spp.)",
          "details": [
            "Rust spreads in warm, humid conditions and is more common in under-fertilized lawns.",
            "The orange or reddish spores rub off easily on hands, shoes, or mowers."
          ],
          "solution":
              "Apply a nitrogen-rich fertilizer to boost lawn growth and mow frequently to remove infected blades. Apply a fungicide if severe.",
          "link": "Affiliate Link: Rust Disease Fertilizer & Fungicide",
          "affiliate_link":
              "https://amzn.to/4iwZh4A;https://amzn.to/4iFzPKr"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Does the rust-like discoloration appear after mowing, especially on older grass blades?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Dull Mower Blades Spreading Spores",
          "solution":
              "Sharpen mower blades and bag clippings to prevent spreading spores.",
          "link": "Affiliate Link: Lawn Mower Blade Sharpener",
          "affiliate_link": "https://amzn.to/3YifraZ"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Has the lawn been watered frequently but not deeply?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Shallow Root Growth & Lawn Stress",
          "solution":
              "Water deeply (1 inch per week) and in the morning to allow drying before night. Avoid frequent shallow watering.",
          "link": "Affiliate Link: Deep Watering Tool",
          "affiliate_link": "https://amzn.to/42OXcem"
        },
        {
          "text": "No",
          "diagnosis": "Poor Airflow",
          "solution":
              "Aerate the lawn to improve air circulation and reduce moisture buildup.",
          "link": "Affiliate Link: Lawn Aerator & Soil Conditioner",
          "affiliate_link":
              "https://amzn.to/42Qe7xu;https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Are the rust-colored areas accompanied by yellowing grass blades?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Nutrient Deficiency (Low Nitrogen or Iron)",
          "solution":
              "Apply a slow-release nitrogen fertilizer and iron supplement to restore color.",
          "link": "Affiliate Link: Nitrogen & Iron Lawn Treatment",
          "affiliate_link": "https://amzn.to/4lUJShE"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Are the rust-colored areas appearing mainly in shaded or damp areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fungal Issue Worsened by Low Sunlight",
          "solution":
              "Trim trees/shrubs for more sunlight and mow at 3\" height for better airflow. Apply a fungicide if severe.",
          "link": "Affiliate Link: Shade Fungicide Treatment",
          "affiliate_link": "https://amzn.to/3RDZ7NU"
        },
        {
          "text": "No",
          "diagnosis": "Environmental Stress (Temp or pH Imbalance)",
          "solution":
              "Perform a soil test to check for deficiencies and adjust pH accordingly.",
          "link": "Affiliate Link: Soil Test Kit & pH Adjuster",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1857254&u=3538080&m=115833&urllink=&afftrack="
        }
      ]
    }
  ]
};

Map<String, dynamic> dropDown10 = {
  "title": "Do you Have Jagged or Chewed Grass Blades?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Are the jagged or chewed grass blades appearing consistently after mowing?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it happens randomly or overnight", "next": "Q4"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Do the grass tips look frayed or torn rather than cleanly cut?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Dull Mower Blades Tearing the Grass",
          "details": [
            "Torn grass blades lose moisture faster and are more prone to disease and stress."
          ],
          "solution":
              "Sharpen mower blades and avoid mowing when grass is wet.",
          "link": "Affiliate Link: Lawn Mower Blade Sharpener",
          "affiliate_link": "https://amzn.to/4iD6joB"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Are you mowing the lawn too short (scalping)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mowing Stress from Scalping",
          "solution":
              "Raise your mower height to at least 3 inches to avoid weakening the lawn.",
          "link": "Affiliate Link: Lawn Mower Height Adjustment Guide",
          "affiliate_link": "https://amzn.to/3RDLbUe"
        },
        {
          "text": "No",
          "diagnosis": "Improper Mowing Technique",
          "solution":
              "Mow in alternating patterns to prevent stressing the same areas.",
          "link": "Affiliate Link: Lawn Mowing Guide for Healthy Growth",
          "affiliate_link": ""
        }
      ]
    },
    {
      "id": "Q4",
      "question":
          "Do you notice small, irregular bite marks or holes on the grass blades?",
      "answers": [
        {"text": "Yes", "next": "Q5"},
        {
          "text": "No, the damage appears as shredded or clipped blades",
          "next": "Q7"
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Are there small insects visible on the grass when you disturb it?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Insect Pests (Armyworms, Sod Webworms, Cutworms)",
          "details": [
            "Armyworms & sod webworms chew on grass blades, often leaving scalloped edges.",
            "Damage is worse in warm, dry conditions and may spread quickly."
          ],
          "solution":
              "Apply a lawn insecticide labeled for armyworms & sod webworms. Water the area lightly after application.",
          "link":
              "Affiliate Link: Lawn Insecticide for Armyworms & Sod Webworms",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994774&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Do you see irregular patches of missing grass along with the chewed blades?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Rabbit or Rodent Damage",
          "details": [
            "Rabbits, voles, and other small animals clip grass blades and may leave trails or droppings."
          ],
          "solution":
              "Use animal repellents or install a temporary barrier around affected areas.",
          "link": "Affiliate Link: Natural Rabbit & Rodent Lawn Repellent",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1657319&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis": "Early Grub Damage",
          "details": [
            "Grubs weaken the lawn, making it more vulnerable to chewing pests."
          ],
          "solution":
              "Apply grub control if you notice other signs of grub activity (loose grass, brown patches).",
          "link": "Affiliate Link: Lawn Grub Killer Treatment",
          "affiliate_link": "https://amzn.to/4jrjDxk"
        }
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the jagged grass blades appearing after rain or watering?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fungal Disease Weakening Blades",
          "solution":
              "Apply a fungicide and improve airflow by aerating the soil.",
          "link": "Affiliate Link: Lawn Fungicide for Disease Prevention",
          "affiliate_link": "https://amzn.to/4jU41CA"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question": "Are the jagged edges mainly on new growth (young blades)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Nutrient Deficiency (Low Potassium or Phosphorus)",
          "solution":
              "Apply a balanced fertilizer with potassium & phosphorus.",
          "link": "Affiliate Link: Lawn Fertilizer with Potassium & Phosphorus",
          "affiliate_link": "https://amzn.to/3YRxULw"
        },
        {
          "text": "No",
          "diagnosis": "Mechanical Stress (Foot Traffic or Pets)",
          "solution":
              "Reduce stress by creating designated walkways and limiting heavy use on the lawn.",
          "link": "Affiliate Link: Lawn Recovery Fertilizer & Soil Conditioner",
          "affiliate_link": "https://amzn.to/4m6HUuH"
        }
      ]
    }
  ]
};

// Question 11
Map<String, dynamic> dropDown11 = {
  "title": "Do You Have Mushrooms or Fungal Growth in Your Lawn?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Are the mushrooms appearing in a circular pattern (a ring or arc)?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, they are scattered or in clusters", "next": "Q4"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Is the grass inside or around the ring darker green than the surrounding lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fairy Ring (Fungal Condition)",
          "details": [
            "Fungus in the soil releases nitrogen, making grass greener inside the ring."
          ],
          "solution":
              "Aerate deeply, remove dead organic material, and apply a wetting agent to help break down fungal buildup.",
          "link": "Affiliate Link: Fairy Ring Treatment & Lawn Aerator",
          "affiliate_link": "https://amzn.to/3EzZsOP"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Does the grass inside the ring turn brown or die?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Severe Fairy Ring Infection",
          "details": [
            "Fungus creates a water-repellent layer in the soil, causing the grass to die."
          ],
          "solution":
              "Aerate, apply a wetting agent, and use a fungicide if necessary. Deep watering can help break up the hydrophobic soil layer.",
          "link":
              "Affiliate Link: Lawn Fungicide for Fairy Ring & Wetting Agent",
          "affiliate_link": "https://amzn.to/3GtFxBA"
        },
        {
          "text": "No",
          "diagnosis": "Less Severe Fairy Ring",
          "solution":
              "Maintain proper aeration and deep watering to prevent fungal buildup."
        }
      ]
    },
    {
      "id": "Q4",
      "question":
          "Are the mushrooms growing after heavy rain or frequent watering?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Excess Moisture Causing Fungal Growth",
          "solution":
              "Reduce watering, improve drainage, and rake/remove mushrooms to prevent spore spread.",
          "link": "Affiliate Link: Lawn Soil Conditioner for Drainage",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question":
          "Are the mushrooms appearing in areas with decaying tree roots, stumps, or buried wood?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Organic Decomposition Feeding Fungal Growth",
          "solution":
              "Remove rotting wood if possible, and apply a nitrogen-based fertilizer to accelerate decomposition.",
          "link":
              "Affiliate Link: Lawn Fertilizer to Break Down Organic Material",
          "affiliate_link": "https://amzn.to/3Etjpqy"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Are the mushrooms appearing in shaded areas with compacted soil?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Shade-Loving Fungi in Low-Light, Moist Conditions",
          "solution":
              "Prune trees/shrubs to allow sunlight and aerate the soil to improve air circulation.",
          "link": "Affiliate Link: Lawn Aerator & Shade-Tolerant Grass Seed",
          "affiliate_link": "https://amzn.to/433kkXZ;https://amzn.to/44M2UQX"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are there any white, moldy patches or slimy textures near the mushrooms?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Slime Mold or Other Fungal Disease",
          "solution":
              "Rake affected areas, improve drainage, and apply a fungicide if spreading persists.",
          "link": "Affiliate Link: Lawn Fungicide for Fungal Growth", 
        },
        {
          "text": "No",
          "diagnosis": "Harmless Mushroom Growth",
          "solution":
              "Manually remove mushrooms, reduce watering, and encourage more air circulation.",
          "link": "Affiliate Link: Lawn Soil Aeration & Drainage Tools",
          "affiliate_link": "https://amzn.to/431WWdn"
        }
      ]
    }
  ]
};

// Question 12
Map<String, dynamic> dropDown12 = {
  "title": "Is Your Lawn Grass Turning Purple or Reddish?",
  "questions": [
    {
      "id": "Q1",
      "question": "Is the discoloration affecting entire patches of the lawn?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {
          "text": "No, it appears on individual grass blades or scattered areas",
          "next": "Q5"
        }
      ]
    },
    {
      "id": "Q2",
      "question": "Has the weather been cold recently, especially at night?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Cold Stress or Seasonal Dormancy",
          "details": [
            "Cool-season grasses (Kentucky bluegrass, fescue) may turn purple or reddish in cold temperatures."
          ],
          "solution":
              "No treatment needed—grass will recover when temperatures rise. If necessary, apply a light nitrogen fertilizer to speed up recovery.",
          "link": "Affiliate Link: Slow-Release Nitrogen Fertilizer",
          "affiliate_link": "https://amzn.to/3Etjx9w"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Are the reddish or purple patches appearing in irregular shapes?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Red Thread Disease",
          "details": [
            "Appears as reddish-pink strands or threads on grass blades, often in nitrogen-deficient lawns."
          ],
          "solution":
              "Apply a nitrogen fertilizer to encourage new growth and mow to remove infected blades. Use a fungicide if severe.",
          "link": "Affiliate Link: Lawn Fungicide for Red Thread Disease",
          "affiliate_link":
              "https://amzn.to/4izipPm;https://shareasale.com/r.cfm?b=1994742&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Do the purple or red patches have a water-soaked or slimy appearance?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pink Snow Mold or Fusarium Patch",
          "details": [
            "Occurs in cold conditions (Pink Snow Mold) or wet conditions (Fusarium Patch)."
          ],
          "solution":
              "Apply a fungicide, improve drainage, and avoid overwatering.",
          "link":
              "Affiliate Link: Lawn Fungicide for Snow Mold & Fusarium Patch",
          "affiliate_link": "https://amzn.to/4izipPm"
        },
        {
          "text": "No",
          "diagnosis": "Nutrient Deficiency or Environmental Stress",
          "solution":
              "Perform a soil test and apply a balanced fertilizer with phosphorus & potassium.",
          "link": "Affiliate Link: Soil Test Kit & Lawn Fertilizer",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1857254&u=3538080&m=115833&urllink=&afftrack=;https://amzn.to/4jqaZPH"
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Is the reddish or purple discoloration concentrated on the tips of the grass blades?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mowing Stress or Dull Mower Blades",
          "solution":
              "Sharpen mower blades and mow at a higher setting (3 inches or more) to reduce stress.",
          "link": "Affiliate Link: Lawn Mower Blade Sharpener",
          "affiliate_link": "https://amzn.to/4m6Ib0H"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Have you noticed yellowing along with the purple or red coloring?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Phosphorus Deficiency",
          "details": [
            "Grass can turn purple or red when lacking phosphorus."
          ],
          "solution":
              "Apply a phosphorus-rich fertilizer to improve root strength and color.",
          "link": "Affiliate Link: Phosphorus-Rich Lawn Fertilizer",
          "affiliate_link": "https://amzn.to/42KrW07"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the reddish or purple areas forming near compacted soil or high-traffic zones?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Compaction Stress",
          "solution":
              "Aerate the lawn to relieve soil compaction and encourage deeper root growth.",
          "link": "Affiliate Link: Lawn Aerator & Soil Conditioner",
          "affiliate_link":
              "https://amzn.to/3EHFu4y;https://amzn.to/3RCra0k"
        },
        {
          "text": "No",
          "diagnosis": "Environmental Stress (Drought, Temperature Swings)",
          "solution":
              "Monitor watering habits and apply a balanced fertilizer to support recovery.",
          "link": "Affiliate Link: Lawn Fertilizer for Stress Recovery",
          "affiliate_link": "https://amzn.to/3GqMO5b"
        }
      ]
    }
  ]
};

// Question 13
Map<String, dynamic> dropDown13 = {
  "title": "Is Your Grass Blades Curling or Wilting?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Are the curling or wilting blades widespread across the lawn?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it’s in isolated spots or certain areas", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question": "Has the lawn experienced hot, dry weather recently?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Drought Stress",
          "details": [
            "Grass curls and wilts when it loses moisture faster than it can replace."
          ],
          "solution":
              "Water deeply (1 inch per week, early morning) and apply a moisture-retaining soil additive.",
          "link": "Affiliate Link: Lawn Moisture Retention Product",
          "affiliate_link": "https://amzn.to/3YGBpoj"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Do the blades curl upward, with tips turning brown or crispy?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Heat Stress or Wind Desiccation",
          "solution":
              "Increase mowing height to at least 3 inches and water deeply 2–3 times per week. Avoid mowing during midday heat.",
          "link": "Affiliate Link: Lawn Heat Stress Recovery Treatment",
          "affiliate_link": "https://amzn.to/4cOgG7A"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question": "Do the curled blades have a bluish or grayish tint?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Drought Stress Leading to Dormancy",
          "solution":
              "Water deeply to encourage root recovery. Consider using a drought-resistant fertilizer.",
          "link": "Affiliate Link: Drought Recovery Lawn Fertilizer",
          "affiliate_link": "https://amzn.to/44d36bJ"
        },
        {
          "text": "No",
          "diagnosis": "Compacted Soil Preventing Water Absorption",
          "solution": "Aerate the soil to improve water infiltration.",
          "link": "Affiliate Link: Lawn Aerator & Soil Conditioner",
          "affiliate_link": "https://amzn.to/3EHFu4y;https://amzn.to/3RCra0k"
        }
      ]
    },
    {
      "id": "Q5",
      "question": "Are the curling blades appearing in circular patches?",
      "answers": [
        {"text": "Yes", "next": "Q6"},
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q6",
      "question": "Do the affected patches have a pinkish or reddish hue?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Red Thread or Pink Patch Disease",
          "solution":
              "Apply a nitrogen-rich fertilizer and, if severe, a fungicide.",
          "link": "Affiliate Link: Lawn Fungicide for Red Thread & Pink Patch",
          "affiliate_link": "https://amzn.to/4izipPm"
        },
        {
          "text": "No",
          "diagnosis": "Root Rot from Overwatering",
          "solution":
              "Reduce watering and apply a fungicide if roots are affected.",
          "link": "Affiliate Link: Lawn Root Rot Treatment",
          "affiliate_link": "https://amzn.to/42xLMgr"
        }
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the curling blades only affecting new growth (younger, softer blades)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Nutrient Deficiency (Potassium or Phosphorus)",
          "solution":
              "Apply a balanced fertilizer with potassium & phosphorus.", 
          "link": "Affiliate Link: Lawn Fertilizer for Root & Blade Strength",
          "affiliate_link": "https://amzn.to/42PWC07"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question": "Do the curled blades have tiny bite marks or frayed edges?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pest Damage (Thrips, Mites, or Leafhoppers)",
          "solution": "Apply a broad-spectrum lawn insecticide.",
          "link": "Affiliate Link: Lawn Insecticide for Thrips & Mites",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994774&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis": "Mowing Stress or Excessive Nitrogen Fertilizer",
          "solution":
              "Raise mowing height and water consistently to prevent nitrogen overload.",
          "link": "Affiliate Link: Lawn Mowing & Fertilization Guide", 
        }
      ]
    }
  ]
};

// Question 14
Map<String, dynamic> dropDown14 = {
  "title": "Are Weeds Taking Over the Lawn?",
  "questions": [
    {
      "id": "Q1",
      "question": "Are the weeds evenly spread throughout the lawn?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {
          "text": "No, they are concentrated in patches or specific areas",
          "next": "Q5"
        }
      ]
    },
    {
      "id": "Q2",
      "question": "Is the lawn thin or patchy, allowing weeds to grow easily?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Poor Lawn Density Allowing Weed Invasion",
          "solution":
              "Overseed with high-quality grass seed and apply a starter fertilizer to promote thicker grass growth.",
          "link": "Affiliate Link: Premium Grass Seed & Starter Fertilizer",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=2625473&u=3538080&m=43235&urllink=&afftrack=;https://www.amazon.com/Andersons-Lawn-Starter-20-27.5-lbs/dp/B07WZPNHTM?&linkCode=sl1&tag=thelawncarewo-20&linkId=9821957ab637092d4079843cfa840512"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Has the lawn been mowed too short (scalped)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mowing Stress Creating Space for Weeds",
          "solution":
              "Raise mower height to 3 inches or more to help grass outcompete weeds.",
          "link": "Affiliate Link: Lawn Mower Height Guide & Blade Sharpener",
          "affiliate_link": "https://amzn.to/4m6Ib0H"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question": "Have you fertilized the lawn within the past 6-8 weeks?",
      "answers": [
        {
          "text": "No",
          "diagnosis":
              "Nutrient Deficiency Weakening the Lawn, Allowing Weeds to Invade",
          "solution":
              "Apply a balanced lawn fertilizer with nitrogen to promote strong grass growth.",
          "link": "Affiliate Link: Lawn Fertilizer for Weed Prevention",
          "affiliate_link": "https://amzn.to/42PjEEa"
        },
        {
          "text": "Yes",
          "diagnosis": "Weeds May Be Naturally Persistent Species",
          "solution":
              "Apply a selective weed killer to remove broadleaf weeds while protecting the lawn.",
          "link": "Affiliate Link: Selective Lawn Weed Killer",
          "affiliate_link": "https://amzn.to/42PjEEa"
        }
      ]
    },
    {
      "id": "Q5",
      "question":
          "Are the weeds mostly broadleaf (dandelions, clover, plantain, etc.)?",
      "answers": [
        {"text": "Yes", "next": "Q6"},
        {
          "text": "No, they are grassy weeds (crabgrass, foxtail, etc.)",
          "next": "Q7"
        }
      ]
    },
    {
      "id": "Q6",
      "question": "Are the broadleaf weeds forming in nutrient-poor areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Low Soil Fertility Encouraging Weed Growth",
          "solution":
              "Apply a broadleaf weed killer and fertilize to boost grass strength.",
          "link": "Affiliate Link: Broadleaf Weed Control & Lawn Fertilizer",
          "affiliate_link": "https://amzn.to/42PjEEa"
        },
        {
          "text": "No",
          "diagnosis": "Weed Seeds in Soil from Previous Seasons",
          "solution":
              "Apply a pre-emergent weed preventer in early spring and fall.",
          "link": "Affiliate Link: Lawn Pre-Emergent Weed Control",
          "affiliate_link": "https://amzn.to/42QAnaw"
        }
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the grassy weeds appearing in early spring and spreading rapidly?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Crabgrass or Annual Grassy Weeds",
          "solution":
              "Apply a crabgrass pre-emergent in early spring to prevent germination.",
          "link": "Affiliate Link: Crabgrass Pre-Emergent Weed Control",
          "affiliate_link": "https://amzn.to/4cLEBo8"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Are the weeds growing in areas with compacted soil or poor drainage?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Compacted Soil Favoring Weeds Over Grass",
          "solution":
              "Aerate the lawn and top-dress with organic material to improve soil quality.",
          "link": "Affiliate Link: Lawn Aerator & Soil Conditioner",
          "affiliate_link":
              "https://amzn.to/3EHFu4y;https://amzn.to/3RCra0k"
        },
        {
          "text": "No",
          "diagnosis":
              "Perennial Grassy Weeds (Like Quackgrass or Dallisgrass)",
          "solution":
              "Apply a selective herbicide for grassy weeds or spot-treat with a non-selective herbicide if needed.",
          "link": "Affiliate Link: Grassy Weed Killer for Lawns",
          "affiliate_link": "https://amzn.to/3ENRKR1"
        }
      ]
    }
  ]
};


// Question 15
Map<String, dynamic> dropDown15 = {
  "title":
      "Do You Have Uneven Lawn Growth? (Some Areas Growing Faster Than Others)",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Are the faster-growing patches noticeably greener than the rest of the lawn?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {
          "text": "No, they are just taller but not necessarily greener",
          "next": "Q5"
        }
      ]
    },
    {
      "id": "Q2",
      "question":
          "Are the greener, faster-growing patches appearing where pets frequently urinate?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pet Urine Spots Providing Excess Nitrogen",
          "solution":
              "Water the area immediately after pet urination to dilute nitrogen. Apply a soil neutralizer if necessary.",
          "link": "Affiliate Link: Pet Urine Lawn Neutralizer",
          "affiliate_link": "https://amzn.to/3RCra0k"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Do the greener patches appear in areas where fertilizer may have been spilled or applied unevenly?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Uneven Fertilizer Distribution",
          "solution":
              "Water lightly to help blend nutrients and use a calibrated spreader for even application in the future.",
          "link": "Affiliate Link: Lawn Spreader for Even Fertilization",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=2583073&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Are the greener areas near buried organic material, like tree roots or old compost piles?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Natural Decomposition Releasing Nitrogen",
          "solution":
              "Even out the growth by applying a balanced slow-release fertilizer across the entire lawn.",
          "link": "Affiliate Link: Slow-Release Lawn Fertilizer",
          "affiliate_link": "https://amzn.to/3YRWhZw"
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question": "Are the taller-growing patches located in shady areas?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Shade-Adapted Growth Patterns",
          "solution":
              "Overseed with shade-tolerant grass seed and mow slightly higher in shaded areas.",
          "link": "Affiliate Link: Shade-Tolerant Grass Seed",
          "affiliate_link": "https://amzn.to/4jss0sy"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Are the uneven growth patches appearing after aeration, dethatching, or lawn repairs?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Temporary Regrowth Differences from Soil Disruption",
          "solution":
              "Allow 3-4 weeks for lawn to even out, and apply a light nitrogen fertilizer to promote uniform growth.",
          "link": "Affiliate Link: Lawn Growth Fertilizer",
          "affiliate_link": "https://amzn.to/4jqoAq9"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the uneven growth areas forming in compacted or heavily trafficked sections of the lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Soil Compaction Restricting Root Growth",
          "solution":
              "Aerate compacted areas and top-dress with organic material to improve soil structure.",
          "link": "Affiliate Link: Lawn Aerator & Soil Conditioner",
          "affiliate_link":
              "https://amzn.to/3EHFu4y;https://amzn.to/3RCra0k"
        },
        {"text": "No", "next": "Q8"}
      ]
    },
    {
      "id": "Q8",
      "question":
          "Are the fast-growing patches forming in areas that stay wetter longer after rain or irrigation?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Excess Moisture Causing Vigorous Grass Growth",
          "solution":
              "Adjust irrigation settings for even water distribution and improve drainage if necessary.",
          "link": "Affiliate Link: Lawn Drainage Improvement Tools",
          "affiliate_link": "https://amzn.to/3EHFu4y"
        },
        {
          "text": "No",
          "diagnosis": "Grass Variety Differences",
          "solution":
              "Overseed the lawn with a uniform grass seed mix to blend different growth rates.",
          "link": "Affiliate Link: Uniform Lawn Grass Seed Mix",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=2625473&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    }
  ]
};

// Question 16
Map<String, dynamic> dropDown16 = {
  "title": "Do You Have a Powdery or Grayish Coating on Grass?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Does the powdery or grayish coating easily rub off when you touch the grass?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it seems embedded in the blades", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Is the coating mostly on the upper surface of grass blades, giving them a dusty or flour-like appearance?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Powdery Mildew (Erysiphe graminis)",
          "solution":
              "Trim surrounding vegetation to allow sunlight, improve airflow, and apply a fungicide if severe.",
          "link": "Affiliate Link: Lawn Fungicide for Powdery Mildew",
          "affiliate_link": "https://amzn.to/4izipPm"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Does the grayish coating form in circular patches and appear slimy when wet?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Slime Mold, a harmless fungal organism",
          "solution":
              "No chemical treatment needed—rake or hose off the mold and improve airflow in the lawn.",
          "link": "Affiliate Link: Lawn Rake & Air Circulation Guide",
          "affiliate_link": "https://amzn.to/4cWiA6s"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Has the lawn been frequently wet due to excessive rain or overwatering?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fungal issue caused by excess moisture",
          "solution":
              "Reduce watering frequency, mow at a higher setting, and apply a fungicide if needed.",
          "link": "Affiliate Link: Lawn Fungicide & Moisture Control Product",
          "affiliate_link": "https://amzn.to/4izipPm"
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question":
          "Is the grayish tint mostly appearing on the lower parts of the blades, near the soil?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Pythium Blight, a serious fungal disease",
          "solution":
              "Apply a fungicide, improve drainage, and reduce evening watering.",
          "link": "Affiliate Link: Lawn Fungicide for Pythium Blight",
          "affiliate_link": "https://amzn.to/42xLMgr"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Are the affected grass blades turning yellow or brown along with the coating?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Gray Leaf Spot Disease",
          "solution":
              "Reduce lawn stress, apply a fungicide, and avoid nitrogen-heavy fertilizers.",
          "link": "Affiliate Link: Fungicide for Gray Leaf Spot",
          "affiliate_link": "https://amzn.to/4izipPm"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "The coating may be caused by soil issues or environmental stress.",
      "answers": [
        {
          "text": "Solution",
          "diagnosis":
              "Aerate the lawn, top-dress with compost, and ensure proper watering habits.",
          "link": "Affiliate Link: Lawn Aerator & Organic Soil Conditioner",
          "affiliate_link":
              "https://amzn.to/3EHFu4y;https://amzn.to/3RCra0k"
        }
      ]
    }
  ]
};

// Question 17
Map<String, dynamic> dropDown17 = {
  "title": "Is There Small Mounds of Dirt Appearing in the Lawn?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Are the mounds made of fine, loose soil with a small hole in the center?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {
          "text": "No, the mounds are irregular or do not have a visible hole",
          "next": "Q5"
        }
      ]
    },
    {
      "id": "Q2",
      "question":
          "Are the mounds about the size of a golf ball to a baseball and appearing randomly?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Earthworm activity",
          "solution":
              "No treatment needed—rake the mounds flat to maintain lawn appearance.",
          "link": "Affiliate Link: Lawn Leveling Rake",
          "affiliate_link": "https://amzn.to/42tCDFA"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Are the mounds larger (3-6 inches wide) with raised tunnels visible nearby?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mole activity",
          "solution":
              "Apply a mole repellent or trap and reduce grub populations.",

          "link": "Affiliate Link: Mole Repellent & Grub Killer Treatment",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1657319&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Do the small mounds appear in clusters, often near gardens or flower beds?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Burrowing insects (ants, wasps, etc.)",
          "solution":
              "Apply an insecticide targeted for burrowing pests and disrupt nests.",
          "link": "Affiliate Link: Insecticide for Lawn Burrowing Pests",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994774&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question":
          "Are the mounds irregular in shape and scattered across the lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Disturbance from heavy rain or wind pushing soil up",
          "solution":
              "Rake the soil evenly and aerate the lawn to encourage soil settling.",
          "link": "Affiliate Link: Lawn Aerator & Leveling Sand",
          "affiliate_link": "https://amzn.to/4cWiA6s"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Do the mounds contain small pebbles, plant debris, or roots?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Nightcrawler or worm castings",

          "solution":
              "Lightly rake to break down castings and maintain a healthy soil balance.",
          "link": "Affiliate Link: Lawn Rake for Soil Leveling",
          "affiliate_link": "https://amzn.to/3YlMuuK"
        },
        {
          "text": "No",
          "diagnosis": "Soil upheaval from frost heaving",
          "solution":
              "Allow natural settling in spring, and overseed to repair any bare patches.",
          "link": "Affiliate Link: Lawn Repair & Overseeding Kit",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=2625473&u=3538080&m=43235&urllink=&afftrack="
        }
      ]
    }
  ]
};

// Question 18
Map<String, dynamic> dropDown18 = {
  "title": "Are There Sticky or Slimy Patches on the Lawn?",
  "questions": [
    {
      "id": "Q1",
      "question":
          "Do the slimy patches appear black, dark green, or have a jelly-like texture?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, the patches feel sticky but not jelly-like", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question":
          "Do the slimy patches appear after heavy rain or prolonged moisture?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Cyanobacteria (Nostoc algae), a water-retaining bacterial colony",
          "solution":
              "Improve lawn drainage and aeration, and apply a soil conditioner to reduce compaction.",
          "link":
              "Affiliate Link: Lawn Aerator & Soil Conditioner for Drainage",
          "affiliate_link":
              "https://amzn.to/4lFQaRU;https://amzn.to/3RCra0k"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Do the slimy patches appear in shaded areas with poor airflow?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Slime mold, a fungal-like organism",
          "solution":
              "Rake or mow the area to break up the mold, improve airflow, and reduce moisture.",
          "link": "Affiliate Link: Lawn Rake for Slime Mold Control",
          "affiliate_link": "https://amzn.to/4cWiA6s"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question": "Do the slimy patches smell bad or feel mushy underfoot?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Anaerobic soil conditions due to overwatering or poor drainage",
          "solution":
              "Reduce watering, aerate, and apply organic matter to improve soil health.",
          "link":
              "Affiliate Link: Soil Aeration & Organic Soil Improver",
          "affiliate_link": "https://amzn.to/4lFQaRU;https://amzn.to/3GqPBLH"
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question":
          "Are the sticky areas appearing after mowing or walking through the lawn?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Honeydew from aphids or scale insects on nearby trees/shrubs",
          "solution":
              "Inspect nearby plants for insects and apply an insecticide if necessary.",
          "link": "Affiliate Link: Insect Control for Lawns & Trees",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994774&u=3538080&m=43235&urllink=&afftrack="
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Do the sticky patches coincide with thick, matted grass that’s difficult to mow?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Excess thatch buildup causing moisture retention",
          "solution":
              "Dethatch the lawn using a thatch rake or power dethatcher.",
          "link": "Affiliate Link: Lawn Dethatcher Tool",
          "affiliate_link": "https://amzn.to/4cMxqMq"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the sticky patches attracting insects or appear shiny when the sun hits them?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Sap dripping from trees onto the lawn",
          "solution":
              "Wash affected areas with water and check nearby trees for insect signs.",
          "link": "Affiliate Link: Tree & Lawn Disease Control",
          "affiliate_link":
              "https://shareasale.com/r.cfm?b=1994774&u=3538080&m=43235&urllink=&afftrack="
        },
        {
          "text": "No",
          "diagnosis":
              "Lawn disease or bacterial growth due to excess moisture",
          "solution":
              "Apply a fungicide, reduce watering, and improve air circulation.",
          "link": "Affiliate Link: Lawn Fungicide for Bacterial Growth",
          "affiliate_link": "https://amzn.to/4izipPm"
        }
      ]
    }
  ]
};

// Question 19
Map<String, dynamic> dropDown19 = {
  "title": "Is Your Scalped Lawn After Mowing?",
  "questions": [
    {
      "id": "Q1",
      "question": "Is the lawn consistently cut too short after mowing?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, scalping happens only in certain areas", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question": "Is your mower set to cut below 2 inches?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mowing too low (scalping stress)",
          "solution":
              "Raise the mower deck to 3 inches or higher, depending on grass type.",
          "link": "Affiliate Link: Lawn Mower Height Guide", 
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question": "Has the lawn been mowed during extreme heat or drought?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Heat stress making the grass more vulnerable to scalping",
          "solution":
              "Mow early in the morning or evening, and avoid mowing during heat waves. Water deeply after scalping to encourage recovery.",
          "link": "Affiliate Link: Lawn Recovery Treatment for Heat Stress",
          "affiliate_link": "https://amzn.to/44HSVfm"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Do the grass blades look torn or frayed instead of cleanly cut?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Dull mower blades tearing the grass instead of cutting it",
          "solution":
              "Sharpen mower blades every 4–6 weeks during mowing season.",
          "link": "Affiliate Link: Lawn Mower Blade Sharpener",
          "affiliate_link": "https://amzn.to/4m6Ib0H"
        },
        {"text": "No", "next": "Q5"}
      ]
    },
    {
      "id": "Q5",
      "question": "Are the scalped areas appearing on uneven or bumpy terrain?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mower deck bouncing on uneven ground",
          "solution":
              "Level the lawn with topdressing and mow at a slower speed.",
          "link": "Affiliate Link: Lawn Leveling Sand & Soil Conditioner",
          "affiliate_link": "https://amzn.to/4lFQaRU"
        },
        {"text": "No", "next": "Q6"}
      ]
    },
    {
      "id": "Q6",
      "question":
          "Are the scalped areas forming near curves, slopes, or sharp turns?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Mower wheels sinking or tilting on slopes",
          "solution":
              "Adjust mowing direction, use a push mower for slopes, or mow in longer, straight passes instead of tight turns.",
          "link": "Affiliate Link: Lawn Care Guide for Mowing Slopes & Curves", 
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Are the scalped patches appearing more after recent heavy rain?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Soft soil causing mower wheels to sink and cut too low",
          "solution":
              "Wait until the lawn dries before mowing, and aerate compacted areas.",
          "link": "Affiliate Link: Lawn Aerator & Soil Conditioner",
          "affiliate_link": "https://amzn.to/4lFQaRU"
        },
        {
          "text": "No",
          "diagnosis": "Mower deck misalignment",
          "solution":
              "Check and adjust the mower deck height evenly across all four wheels.",
          "link": "Affiliate Link: Mower Deck Leveling & Maintenance Kit",
          "affiliate_link": "https://amzn.to/4jEsQCw"
        }
      ]
    }
  ]
};

// Question 20
Map<String, dynamic> dropDown20 = {
  "title": "Is There an Unusual Odor Coming from the Soil?",
  "questions": [
    {
      "id": "Q1",
      "question": "Does the odor resemble rotten eggs or sulfur?",
      "answers": [
        {"text": "Yes", "next": "Q2"},
        {"text": "No, it smells musty, moldy, or like decay", "next": "Q5"}
      ]
    },
    {
      "id": "Q2",
      "question": "Has the lawn been overly wet or recently flooded?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Anaerobic soil conditions (sulfur-smelling gases)",
          "solution": "Aerate the lawn, improve drainage, and reduce watering.",
          "link":
              "Affiliate Link: Lawn Aerator & Soil Conditioner for Drainage",
          "affiliate_link":
              "https://amzn.to/4lFQaRU;https://amzn.to/3RCra0k"
        },
        {"text": "No", "next": "Q3"}
      ]
    },
    {
      "id": "Q3",
      "question":
          "Are there visible dark, slimy patches or areas that remain soggy for long periods?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Pythium Root Rot or bacterial decay due to excessive moisture",
          "solution":
              "Apply a fungicide, improve air circulation, and adjust watering practices.",
          "link": "Affiliate Link: Lawn Fungicide for Root Rot & Moisture Control",
          "affiliate_link": "https://amzn.to/42xLMgr"
        },
        {"text": "No", "next": "Q4"}
      ]
    },
    {
      "id": "Q4",
      "question":
          "Does the smell get worse when the soil is disturbed (digging, aerating, or heavy rainfall)?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Sulfur-reducing bacteria breaking down organics in compacted soil",
          "solution":
              "Aerate the soil, apply gypsum or organic matter to balance soil chemistry.",
          "link": "Affiliate Link: Gypsum Soil Conditioner & Organic Compost",
          "affiliate_link": "https://amzn.to/3RCra0k"
        },
        {
          "text": "No",
          "diagnosis": "Stagnant water trapped below the surface",
          "solution":
              "Improve lawn drainage and apply a liquid aerator if needed.",
          "link": "Affiliate Link: Liquid Lawn Aerator & Drainage Improver",
          "affiliate_link": "https://amzn.to/3YLiKHK"
        }
      ]
    },
    {
      "id": "Q5",
      "question": "Does the odor resemble mold, mildew, or dampness?",
      "answers": [
        {"text": "Yes", "next": "Q6"},
        {
          "text":
              "No, it smells like rotting organic matter (compost, manure, or decaying roots)",
          "next": "Q8"
        }
      ]
    },
    {
      "id": "Q6",
      "question":
          "Are there visible patches of mold, mushrooms, or fungal growth on the soil?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Fungal decomposition of organic material",
          "solution":
              "Rake the area, improve airflow, and apply a fungicide if needed.",
          "link": "Affiliate Link: Lawn Fungicide for Mold & Fungal Growth",
          "affiliate_link": "https://amzn.to/4izipPm"
        },
        {"text": "No", "next": "Q7"}
      ]
    },
    {
      "id": "Q7",
      "question":
          "Is the musty smell strongest in shady areas with poor airflow?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis":
              "Moss, algae, or debris breaking down in damp shade",
          "solution":
              "Trim trees/shrubs for more sunlight and apply a moss/algae treatment.",
          "link": "Affiliate Link: Lawn Moss & Algae Control Treatment",
          "affiliate_link": "https://amzn.to/3YhWQfc"
        },
        {
          "text": "No",
          "diagnosis": "Soil-borne fungal spores thriving in humid conditions",
          "solution":
              "Aerate and apply a biofungicide to rebalance soil microbes.",
          "link": "Affiliate Link: Lawn Biofungicide for Soil Health",
          "affiliate_link": "https://amzn.to/4lOhiOH"
        }
      ]
    },
    {
      "id": "Q8",
      "question":
          "Has the lawn been recently treated with manure, compost, or organic fertilizers?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Natural breakdown releasing gases",
          "solution":
              "No action needed—odor will dissipate. Water lightly to speed breakdown.",
        },
        {"text": "No", "next": "Q9"}
      ]
    },
    {
      "id": "Q9",
      "question":
          "Are tree roots, stumps, or buried organic matter present in the affected area?",
      "answers": [
        {
          "text": "Yes",
          "diagnosis": "Decomposing roots releasing decay odors",
          "solution":
              "Excavate and remove rotting matter or apply a high-nitrogen fertilizer to accelerate decomposition.",
          "link":
              "Affiliate Link: High-Nitrogen Fertilizer for Organic Breakdown",
          "affiliate_link": "https://amzn.to/4jREw4P"
        },
        {
          "text": "No",
          "diagnosis":
              "Deep soil compaction preventing oxygen flow",
          "solution":
              "Deep-tine aerate the lawn and apply a microbial soil treatment to rebalance the soil.",
          "link":
              "Affiliate Link: Deep-Tine Lawn Aerator & Microbial Soil Treatment",
          "affiliate_link": "https://amzn.to/3EHFu4y & https://amzn.to/3S8Jw9b"
        }
      ]
    }
  ]
};

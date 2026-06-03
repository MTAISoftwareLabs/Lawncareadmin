import 'package:lawn_care/models/home_model.dart';

// Actually usually data files don't import themselves.
// But previous file didn't need it.

class SelfDiagnosisData {
  static final List<SelfDiagnosisItem> items = [
    // Question 1
    SelfDiagnosisItem(
      id: "1",
      title: "Do You Have Brown Patches in Your Lawn?",
      imageUrl: "",
      questions: [
        Question(
          id: "1_a",
          question: "What do the brown patches look like?",
          answers: [
            Answer(
              text: "Circular or have a distinct pattern",
              nextQuestionId: "1_b",
            ),
            Answer(
              text: "No, the patches are irregular in shape",
              nextQuestionId: "1_e",
            ),
          ],
        ),
        Question(
          id: "1_b",
          question:
              "Do the patches have a darker, water-soaked or smoky ring around the edges?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Brown Patch Disease (Rhizoctonia)",
                details: [
                  "This is a classic sign of Brown Patch Disease.",
                  "Brown Patch thrives in warm, humid conditions, usually in summer.",
                  "The patches can be a few inches to several feet wide.",
                  "The affected grass blades look water-soaked or tan with a dark border.",
                ],
                solution:
                    "Apply a fungicide like Scotts DiseaseEx and reduce evening watering.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qv6BCB",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_c"),
          ],
        ),
        Question(
          id: "1_c",
          question:
              "Are the patches small (1-3 inches in diameter) and look like silver-dollar-sized spots?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Dollar Spot Disease",
                details: [
                  "Likely Dollar Spot Disease.",
                  "More common in lawns that are low in nitrogen.",
                  "Can spread quickly in humid weather, especially in the morning when there’s dew and the soil is on the drier side.",
                ],
                solution: "Apply a fungicide and a light nitrogen fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3Zkl2xg",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_d"),
          ],
        ),
        Question(
          id: "1_d",
          question:
              "Do the patches have thin, reddish-brown threads or webbing on the grass blades?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Red Thread Disease",
                details: [
                  "Likely Red Thread Disease, common in nitrogen-deficient lawns.",
                  "The grass may not be dying, just discolored.",
                ],
                solution:
                    "Apply a nitrogen fertilizer and improve soil health. No fungicide necessary.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/464hEdI",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_e"),
          ],
        ),
        Question(
          id: "1_e",
          question:
              "Does the grass easily pull up from the affected area, like it has no roots?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Grub Damage",
                details: [
                  "This is a sign of grub damage (pest infestation).",
                  "Grubs feed on grassroots, making the lawn easy to lift like a carpet.",
                ],
                solution:
                    "Apply a grub control treatment like BioAdvanced Grub Killer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sPgRXZ",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_f"),
          ],
        ),
        Question(
          id: "1_f",
          question: "Is the soil very soft, spongy, or does it smell bad?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pythium Blight",
                details: [
                  "Likely Pythium Blight, a severe water-related fungus.",
                ],
                solution:
                    "Improve lawn drainage, reduce watering, and apply a fungicide.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YQjkDP",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_g"),
          ],
        ),
        Question(
          id: "1_g",
          question:
              "Do the brown patches appear after mowing, or does your lawn look scalped?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mowing Stress",
                details: ["Likely mowing stress or dull mower blades."],
                solution: "Raise your mower height and sharpen the blades.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jRAdrh",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_h"),
          ],
        ),
        Question(
          id: "1_h",
          question:
              "Do the patches appear in areas where pets frequently urinate?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pet Urine Damage",
                details: ["Likely pet urine damage."],
                solution:
                    "Water the area immediately after your pet urinates. Apply a soil conditioner to neutralize salts such as gypsum.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45nDSHn",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_i"),
          ],
        ),
        Question(
          id: "1_i",
          question:
              "Are the patches mainly in sunny areas, appearing during hot weather?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Heat Stress or Drought Damage",
                details: ["Likely heat stress or drought damage."],
                solution:
                    "Deep water in the morning, apply a moisture-retaining soil conditioner, and avoid mowing during heat waves.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pJXCMF",
              ),
            ),
            Answer(text: "No", nextQuestionId: "1_j"),
          ],
        ),
        Question(
          id: "1_j",
          question: "Is the affected area in the shade or under a tree?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Shade Stress or Root Competition",
                details: [
                  "Could be shade stress or root competition from trees.",
                ],
                solution:
                    "Overseed with shade-tolerant grass seed and trim tree branches to allow more sunlight.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49FTmb6",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Soil Issue",
                details: [
                  "The cause may be a soil issue, such as compaction or nutrient deficiency.",
                ],
                solution: "Aerate the soil and apply a balanced fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4r8DFQV",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 2
    SelfDiagnosisItem(
      id: "2",
      title: "Do You Have Yellowing Grass?",
      imageUrl: "",
      questions: [
        Question(
          id: "2_a",
          question: "Is the yellowing uniform across the entire lawn?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "2_b"),
            Answer(
              text: "No, it's in patches or streaks",
              nextQuestionId: "2_f",
            ),
          ],
        ),
        Question(
          id: "2_b",
          question: "Has the lawn been fertilized recently?",
          answers: [
            Answer(text: "Yes, within the last 2 weeks", nextQuestionId: "2_c"),
            Answer(text: "No", nextQuestionId: "2_d"),
          ],
        ),
        Question(
          id: "2_c",
          question: "Did the yellowing appear shortly after fertilizing?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fertilizer Burn",
                details: [
                  "Likely fertilizer burn (over-fertilization).",
                  "Too much nitrogen can scorch the grass, turning it yellow or brown.",
                ],
                solution:
                    "Deep water the area for several days to flush out excess nitrogen. If severe, apply a soil conditioner to help recover.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45ln4ko",
              ),
            ),
            Answer(text: "No", nextQuestionId: "2_d"),
          ],
        ),
        Question(
          id: "2_d",
          question:
              "Is the lawn receiving enough water (at least 1 inch per week)?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "2_e"),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Drought Stress",
                details: [
                  "Likely drought stress.",
                  "Grass turns yellow before turning brown when it lacks water.",
                ],
                solution:
                    "Deep water in the morning 2-3 times per week rather than shallow daily watering. Use a moisture-retaining soil additive.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sUuO7a",
              ),
            ),
          ],
        ),
        Question(
          id: "2_e",
          question:
              "Are the lower grass blades turning yellow first, while the top remains green?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Nitrogen Deficiency",
                details: [
                  "Likely nitrogen deficiency.",
                  "Grass loses its deep green color when lacking nitrogen, starting from the lower leaves.",
                ],
                solution: "Apply a slow-release nitrogen fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YNYVzm",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Iron or Magnesium Deficiency",
                details: ["Could be iron or magnesium deficiency."],
                solution: "Apply iron supplement or micronutrient fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pOkDOI",
              ),
            ),
          ],
        ),
        Question(
          id: "2_f",
          question: "Are the yellow patches appearing in streaks or lines?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mowing or Fertilizer Application Issue",
                details: [
                  "Likely mowing or fertilizer application issue.",
                  "Streaky yellowing can happen when fertilizer is applied unevenly or mower blades are dull.",
                ],
                solution:
                    "Sharpen mower blades & use a spread calibrator for even fertilizer application.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NBmdWA",
              ),
            ),
            Answer(text: "No", nextQuestionId: "2_g"),
          ],
        ),
        Question(
          id: "2_g",
          question:
              "Do the yellow patches have a reddish tint or powdery texture?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Rust Disease",
                details: [
                  "Likely Rust Disease (fungus).",
                  "Common in low nitrogen lawns, it produces orange or rust-colored spores on grass blades.",
                ],
                solution:
                    "Apply nitrogen fertilizer and improve air circulation.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NTZLYP",
              ),
            ),
            Answer(text: "No", nextQuestionId: "2_h"),
          ],
        ),
        Question(
          id: "2_h",
          question: "Do the yellowing areas feel soft and waterlogged?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Overwatering or Fungal Disease",
                details: [
                  "Likely overwatering or fungal disease (e.g., Pythium Blight).",
                ],
                solution:
                    "Reduce watering, improve drainage, and apply a fungicide.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LWjjLF",
              ),
            ),
            Answer(text: "No", nextQuestionId: "2_i"),
          ],
        ),
        Question(
          id: "2_i",
          question: "Are the yellow patches appearing near pet urine spots?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pet Urine Damage",
                details: [
                  "Likely pet urine damage.",
                  "High nitrogen in dog urine causes yellowing with dark green edges.",
                ],
                solution:
                    "Water the area immediately after urination & apply a soil neutralizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jMyraS",
              ),
            ),
            Answer(text: "No", nextQuestionId: "2_j"),
          ],
        ),
        Question(
          id: "2_j",
          question:
              "Are the yellow areas near sidewalks, driveways, or streets?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Heat Stress or Salt Buildup",
                details: [
                  "Likely heat stress from reflected sunlight or salt buildup (from de-icing salt in winter).",
                ],
                solution:
                    "Apply gypsum to neutralize salt & deep water the area to flush salts.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jMTjPv",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Compacted Soil Issues",
                details: ["Check for compacted soil issues."],
                solution:
                    "Aerate the soil and apply a balanced lawn fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NBmuZC",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 3
    SelfDiagnosisItem(
      id: "3",
      title: "Are There Thinning or Bare Spots in Your Lawn?",
      imageUrl: "",
      questions: [
        Question(
          id: "3_a",
          question:
              "Are the thin or bare spots appearing in large, random areas across the lawn?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "3_b"),
            Answer(
              text: "No, the thinning is concentrated in specific areas",
              nextQuestionId: "3_e",
            ),
          ],
        ),
        Question(
          id: "3_b",
          question: "Have you recently applied fertilizer or weed killer?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "3_c"),
            Answer(text: "No", nextQuestionId: "3_d"),
          ],
        ),
        Question(
          id: "3_c",
          question: "Did the thinning appear after applying a weed killer?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Herbicide Damage",
                details: [
                  "Likely herbicide damage (grass unintentionally affected).",
                  "Some weed killers can stress or kill grass if over-applied or applied in hot weather.",
                ],
                solution:
                    "Water deeply to flush chemicals and overseed damaged areas.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sMKPfa",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Fertilizer Burn",
                details: [
                  "Could be fertilizer burn (if excessive nitrogen was applied).",
                ],
                solution:
                    "Deep water the area and apply a soil neutralizer if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sMKPfa",
              ),
            ),
          ],
        ),
        Question(
          id: "3_d",
          question:
              "Is the thinning widespread but the grass still growing, just weak and sparse?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency or Compacted Soil",
                details: ["Likely nutrient deficiency or compacted soil."],
                solution:
                    "Apply a balanced lawn fertilizer and aerate compacted soil.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yERXW",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Pest or Disease Issues",
                details: ["Could be underlying pest or disease issues."],
                solution:
                    "Inspect roots for pests (grubs) or signs of fungal infection.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3Lp5FRb",
              ),
            ),
          ],
        ),
        Question(
          id: "3_e",
          question: "Are the thinning spots near trees or shaded areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Shade Stress or Tree Root Competition",
                details: [
                  "Likely shade stress or tree root competition.",
                  "Tree roots compete for nutrients and water, causing thinning.",
                ],
                solution:
                    "Overseed with shade-tolerant grass seed and prune low-hanging branches.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4t7hMDt",
              ),
            ),
            Answer(text: "No", nextQuestionId: "3_f"),
          ],
        ),
        Question(
          id: "3_f",
          question:
              "Do the thin spots feel soft, mushy, or appear waterlogged?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Overwatering or Fungal Disease",
                details: ["Likely overwatering or fungal disease."],
                solution:
                    "Reduce watering, improve drainage, and apply a fungicide.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45VoRNd",
              ),
            ),
            Answer(text: "No", nextQuestionId: "3_g"),
          ],
        ),
        Question(
          id: "3_g",
          question: "Do the thinning areas pull up easily like sod?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Grub Infestation",
                details: [
                  "Likely grub infestation.",
                  "Grubs eat the roots, causing grass to detach easily from the soil.",
                ],
                solution:
                    "Apply a grub control treatment like BioAdvanced Grub Killer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jMVPVX",
              ),
            ),
            Answer(text: "No", nextQuestionId: "3_h"),
          ],
        ),
        Question(
          id: "3_h",
          question:
              "Are there small tunnels or mounds of dirt in the thinning areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mole or Vole Activity",
                details: ["Likely mole or vole activity."],
                solution: "Use mole/vole repellents or traps to deter pests.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45QfZsa",
              ),
            ),
            Answer(text: "No", nextQuestionId: "3_i"),
          ],
        ),
        Question(
          id: "3_i",
          question: "Has the lawn been recently dethatched or aerated?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Temporary Stress",
                details: ["Possible temporary stress from mechanical damage."],
                solution: "Lightly fertilize and water to help recovery.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NAaHe3",
              ),
            ),
            Answer(text: "No", nextQuestionId: "3_j"),
          ],
        ),
        Question(
          id: "3_j",
          question:
              "Have you noticed animals like birds, skunks, or raccoons digging in the lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pests Attracting Predators",
                details: [
                  "Likely pests (grubs, insects) attracting predators.",
                ],
                solution:
                    "Apply grub or insect control and use animal repellents.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4r5tZ9H",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Compacted Soil or Nutrient Deficiency",
                details: [
                  "The soil may be too compacted or lacking nutrients.",
                ],
                solution: "Aerate and fertilize to encourage new growth.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LTcSZO",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 4
    SelfDiagnosisItem(
      id: "4",
      title: "Is Grass Pulling Up Easily (Weak Roots)?",
      imageUrl: "",
      questions: [
        Question(
          id: "4_a",
          question:
              "When you pull on the grass, does it come up in large, loose chunks like sod?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "4_b"),
            Answer(
              text: "No, it stays mostly intact but looks weak",
              nextQuestionId: "4_e",
            ),
          ],
        ),
        Question(
          id: "4_b",
          question:
              "Do you see white, C-shaped larvae (grubs) in the soil under the grass?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Grub Infestation",
                details: [
                  "Likely grub infestation.",
                  "Grubs feed on the roots, causing the grass to detach easily.",
                ],
                solution:
                    "Apply a grub control treatment like BioAdvanced Grub Killer. Water deeply after application.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jMVPVX",
              ),
            ),
            Answer(text: "No", nextQuestionId: "4_c"),
          ],
        ),
        Question(
          id: "4_c",
          question: "Do you see tunnels or raised ridges under the grass?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Moles or Voles",
                details: ["Likely moles or voles disrupting root systems."],
                solution:
                    "Use mole/vole repellents or traps to prevent further damage.",
                affiliateTitle: "Get Product",
                affiliateLink:
                    "https://shareasale.com/r.cfm?b=414281&u=3538080&m=43235&urllink=&afftrack=",
              ),
            ),
            Answer(text: "No", nextQuestionId: "4_d"),
          ],
        ),
        Question(
          id: "4_d",
          question: "Is the soil extremely dry, hard, or compacted?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Compacted Soil",
                details: ["Likely compacted soil preventing root penetration."],
                solution:
                    "Aerate the lawn and apply a soil conditioner to improve root development.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3GsXeBq", // Primary link
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Root Rot",
                details: [
                  "The grass may be suffering from root rot due to overwatering.",
                ],
                solution:
                    "Reduce watering frequency and improve drainage. Apply fungicide if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4334lcu",
              ),
            ),
          ],
        ),
        Question(
          id: "4_e",
          question:
              "Is the grass thin and weak, but not detaching from the soil?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency or Poor Soil Health",
                details: ["Likely nutrient deficiency or poor soil health."],
                solution:
                    "Apply a balanced fertilizer with phosphorus to promote root growth.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3EF9Yo0",
              ),
            ),
            Answer(text: "No", nextQuestionId: "4_f"),
          ],
        ),
        Question(
          id: "4_f",
          question:
              "Does the grass have a reddish or rust-colored dust when you run your hand over it?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Rust Disease",
                details: [
                  "Likely Rust Disease, which weakens grass and stunts root growth.",
                ],
                solution: "Apply nitrogen fertilizer and a fungicide.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/42xnTFN",
              ),
            ),
            Answer(text: "No", nextQuestionId: "4_g"),
          ],
        ),
        Question(
          id: "4_g",
          question:
              "Does the grass struggle to recover after mowing or foot traffic?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Drought Stress or Shallow Roots",
                details: ["Likely drought stress or shallow root development."],
                solution:
                    "Water deeply and less frequently to encourage deeper roots.",
                affiliateTitle: "Get Product",
                affiliateLink:
                    "https://shareasale.com/r.cfm?b=1994752&u=3538080&m=43235&urllink=&afftrack=",
              ),
            ),
            Answer(text: "No", nextQuestionId: "4_h"),
          ],
        ),
        Question(
          id: "4_h",
          question:
              "Have you noticed an excessive thatch layer (spongy buildup between grass and soil)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Thatch Buildup",
                details: [
                  "Thatch buildup is preventing roots from accessing soil nutrients.",
                ],
                solution:
                    "Dethatch the lawn using a thatch rake or power dethatcher.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jw4vPv",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Chemical Damage",
                details: [
                  "The grass may have been affected by chemical damage.",
                ],
                solution:
                    "Flush the soil with deep watering and apply a soil recovery product.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YhwkT9",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 5
    SelfDiagnosisItem(
      id: "5",
      title: "Is Your Lawn Mushy or Waterlogged?",
      imageUrl: "",
      questions: [
        Question(
          id: "5_a",
          question:
              "Is the grass constantly wet, even when it hasn't rained recently?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "5_b"),
            Answer(
              text: "No, it only happens after rain or watering",
              nextQuestionId: "5_d",
            ),
          ],
        ),
        Question(
          id: "5_b",
          question:
              "Does water pool in low spots or certain areas of your lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Poor Drainage or Compacted Soil",
                details: [
                  "Likely poor drainage or compacted soil.",
                  "Water sits on the surface because the soil is too compacted to absorb it.",
                ],
                solution:
                    "Aerate the lawn and add organic matter or sand to improve drainage. Consider installing French drains if necessary.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LTcSZO",
              ),
            ),
            Answer(text: "No", nextQuestionId: "5_c"),
          ],
        ),
        Question(
          id: "5_c",
          question: "Does the grass have a slimy or moldy appearance?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Algae or Slime Mold",
                details: [
                  "Likely Algae or Slime Mold, caused by excess moisture and lack of air circulation.",
                ],
                solution:
                    "Reduce watering, rake affected areas, and apply a soil conditioner to improve drainage.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qBzDR6",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Fungal Disease Risk",
                details: [
                  "The waterlogged conditions may be encouraging fungal disease.",
                ],
                solution: "Apply a fungicide and adjust watering practices.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LToego",
              ),
            ),
          ],
        ),
        Question(
          id: "5_d",
          question:
              "Does the lawn turn mushy only after heavy rain or watering?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "5_e"),
            Answer(text: "No", nextQuestionId: "5_f"),
          ],
        ),
        Question(
          id: "5_e",
          question:
              "Does the water drain within a few hours, or does it linger for a long time?",
          answers: [
            Answer(
              text: "Drains within a few hours",
              diagnosis: Diagnosis(
                title: "Temporary Saturation",
                details: ["Likely temporary saturation."],
                solution:
                    "Allow the lawn to dry before watering again. Mow at a higher setting to avoid scalping wet grass.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(
              text: "Lingers for a long time",
              diagnosis: Diagnosis(
                title: "Clay-Heavy Soil",
                details: ["Likely clay-heavy soil holding too much water."],
                solution: "Apply gypsum to break up clay and improve drainage.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pOUnnd",
              ),
            ),
          ],
        ),
        Question(
          id: "5_f",
          question:
              "Do the grass blades appear yellow or wilted despite the wet conditions?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Root Rot or Fungal Infection",
                details: [
                  "Likely root rot or fungal infection from excess moisture.",
                ],
                solution:
                    "Apply a fungicide and improve drainage. Avoid watering in the evening.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LToego",
              ),
            ),
            Answer(text: "No", nextQuestionId: "5_g"),
          ],
        ),
        Question(
          id: "5_g",
          question:
              "Are there mushrooms or other fungal growths in the affected areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Organic Matter Decomposition",
                details: [
                  "Likely organic matter decomposing in excess moisture.",
                ],
                solution:
                    "Remove mushrooms manually and aerate the lawn. Improve air circulation by mowing regularly.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NToxIx",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Excess Thatch",
                details: ["The issue may be too much thatch holding moisture."],
                solution:
                    "Dethatch the lawn using a power rake or thatching tool.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4bH3iUc",
              ),
            ),
          ],
        ),
      ],
    ),
    // ... Additional items will be appended ...
    // Question 6
    SelfDiagnosisItem(
      id: "6",
      title: "Is Your Lawn Dying in Circular Patterns?",
      imageUrl: "",
      questions: [
        Question(
          id: "6_a",
          question:
              "Are the circular dead spots surrounded by a darker ring or have a “smoky” outer edge?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "6_b"),
            Answer(
              text: "No, the circles are solid, without a distinct ring",
              nextQuestionId: "6_d",
            ),
          ],
        ),
        Question(
          id: "6_b",
          question:
              "Do the affected areas appear during warm, humid conditions?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Brown Patch Disease",
                details: [
                  "Likely Brown Patch Disease (Rhizoctonia solani).",
                  "Common in cool-season grasses during hot, humid weather.",
                  "Patches can be several inches to several feet wide.",
                ],
                solution:
                    "Apply a fungicide and avoid watering in the evening. Reduce nitrogen if excessive.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LToego",
              ),
            ),
            Answer(text: "No", nextQuestionId: "6_c"),
          ],
        ),
        Question(
          id: "6_c",
          question: "Do the patches start small and gradually expand outward?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Dollar Spot Disease",
                details: [
                  "Likely Dollar Spot Disease (caused by a nitrogen deficiency).",
                  "Small silver-dollar-sized spots that merge over time.",
                ],
                solution:
                    "Apply a fungicide and a balanced nitrogen fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink:
                    "https://amzn.to/3Zkl2xg", // User provided partial link or check context.
                // Context check: Question 6c link is empty in text "Affiliate Link: " ??
                // Wait, text says: "[Affiliate Link: " (empty?). Let's check Q1c link: https://amzn.to/3Zkl2xg
                // I will use Q1c link or look for if user pasted link later.
                // Text says: "Affiliate Link: " then next line "No -> Could be...".
                // I will use generic or leave empty?
                // Actually in User Request: "Affiliate Link: \n No -> Could be..."
                // It seems missing. I'll use the one from Q1c as it is also Dollar Spot: https://amzn.to/3Zkl2xg
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Fusarium Patch",
                details: ["Could be Fusarium Patch, another fungal disease."],
                solution:
                    "Apply a fungicide and improve drainage. Avoid excessive nitrogen in fall.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49Q6lad",
              ),
            ),
          ],
        ),
        Question(
          id: "6_d",
          question:
              "Do the dead circles have grass growing in the center, resembling a “frog eye” pattern?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Necrotic Ring Spot (NRS)",
                details: [
                  "Likely Necrotic Ring Spot (NRS), a soil-borne fungus.",
                  "Common in Kentucky Bluegrass and cool-season lawns.",
                ],
                solution:
                    "Overseed with resistant grass varieties and apply fungicide.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49Q6lad",
              ),
            ),
            Answer(text: "No", nextQuestionId: "6_e"),
          ],
        ),
        Question(
          id: "6_e",
          question:
              "Are the circles accompanied by mushrooms or fungal growth?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fairy Ring",
                details: [
                  "Likely Fairy Ring (a soil fungus feeding on decaying matter).",
                  "May have a ring of lush green grass or mushrooms around it.",
                ],
                solution:
                    "Aerate deeply, remove thatch, and apply a wetting agent to help break down fungal buildup.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YP62aA",
              ),
            ),
            Answer(text: "No", nextQuestionId: "6_f"),
          ],
        ),
        Question(
          id: "6_f",
          question:
              "Do the patches feel spongy and does the grass pull up easily?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Grub Damage",
                details: ["Likely grub damage (pests eating roots)."],
                solution:
                    "Apply grub control treatment like BioAdvanced Grub Killer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jMVPVX",
              ),
            ),
            Answer(text: "No", nextQuestionId: "6_g"),
          ],
        ),
        Question(
          id: "6_g",
          question:
              "Are the circles appearing in dry, compacted areas of the lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Localized Dry Spots",
                details: ["Likely localized dry spots (hydrophobic soil)."],
                solution:
                    "Apply a wetting agent or organic matter to improve soil water retention.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YP62aA",
              ),
            ),
            Answer(text: "No", nextQuestionId: "6_h"),
          ],
        ),
        Question(
          id: "6_h",
          question:
              "Have you recently applied a chemical or fertilizer in the area?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Chemical Burn or Fertilizer Spill",
                details: ["Likely chemical burn or fertilizer spill."],
                solution:
                    "Deep water the area to dilute salts and apply a soil neutralizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pOUnnd",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Pet Urine or Animal Activity",
                details: [
                  "The circles could be caused by pet urine or animal activity.",
                ],
                solution:
                    "Flush with water immediately after pet urination and apply a soil amendment.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LMqpCh",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 7
    SelfDiagnosisItem(
      id: "7",
      title: "Do you Have Dry, Straw-Like Grass?",
      imageUrl: "",
      questions: [
        Question(
          id: "7_a",
          question:
              "Does the dry, straw-like grass appear throughout the entire lawn?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "7_b"),
            Answer(
              text: "No, it appears in specific areas",
              nextQuestionId: "7_e",
            ),
          ],
        ),
        Question(
          id: "7_b",
          question:
              "Is the grass turning straw-colored after extreme heat or drought?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Heat Stress or Dormancy",
                details: [
                  "Likely heat stress or dormancy.",
                  "Grass goes into dormancy in high heat to conserve water.",
                ],
                solution:
                    "Deep water in the morning (1 inch per week, 2–3x per week) and avoid mowing too short.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pMwTyU",
              ),
            ),
            Answer(text: "No", nextQuestionId: "7_c"),
          ],
        ),
        Question(
          id: "7_c",
          question: "Has the lawn been mowed very short (scalped)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mowing Stress",
                details: ["Likely mowing stress."],
                solution:
                    "Raise the mower height to at least 3 inches and sharpen blades.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49QcJhT",
              ),
            ),
            Answer(text: "No", nextQuestionId: "7_d"),
          ],
        ),
        Question(
          id: "7_d",
          question: "Has the lawn been fertilized within the past two weeks?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fertilizer Burn",
                details: ["Likely fertilizer burn."],
                solution:
                    "Deep water the area to dilute excess nitrogen and apply a soil neutralizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YOFHJS",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency",
                details: ["The lawn may be lacking nutrients."],
                solution:
                    "Apply a balanced fertilizer with potassium to strengthen grass.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sQNILV",
              ),
            ),
          ],
        ),
        Question(
          id: "7_e",
          question:
              "Does the dry, straw-like grass appear in high-traffic areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Soil Compaction",
                details: ["Likely soil compaction from foot traffic."],
                solution:
                    "Aerate the lawn and apply organic matter to improve soil structure.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "7_f"),
          ],
        ),
        Question(
          id: "7_f",
          question: "Does the dry grass appear near pet urine spots?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pet Urine Damage",
                details: [
                  "Likely pet urine damage (high nitrogen concentration).",
                ],
                solution:
                    "Flush the area with water and apply a pet urine neutralizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NTqhBz",
              ),
            ),
            Answer(text: "No", nextQuestionId: "7_g"),
          ],
        ),
        Question(
          id: "7_g",
          question: "Does the dry grass pull up easily, like it has no roots?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Grub Damage",
                details: ["Likely grub damage (pests eating the roots)."],
                solution:
                    "Apply grub control treatment like BioAdvanced Grub Killer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qDQYZS",
              ),
            ),
            Answer(text: "No", nextQuestionId: "7_h"),
          ],
        ),
        Question(
          id: "7_h",
          question:
              "Does the lawn look patchy, with some green areas and some straw-like areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Disease Stress",
                details: [
                  "Likely disease stress (e.g., Dollar Spot or Fusarium Patch).",
                ],
                solution: "Apply a fungicide and a light nitrogen boost.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49Q6lad",
              ),
            ),
            Answer(text: "No", nextQuestionId: "7_i"),
          ],
        ),
        Question(
          id: "7_i",
          question: "Are the dry patches forming in shaded areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Shade Stress",
                details: ["Likely shade stress."],
                solution:
                    "Overseed with shade-tolerant grass and prune trees to allow more light.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4a4Fo3N",
              ),
            ),
            Answer(text: "No", nextQuestionId: "7_j"),
          ],
        ),
        Question(
          id: "7_j",
          question:
              "Does the lawn have an excessive thatch layer (spongy buildup between soil and grass)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Thatch Buildup",
                details: [
                  "Likely thatch buildup preventing water and nutrients from reaching roots.",
                ],
                solution:
                    "Dethatch the lawn using a power rake or thatch rake.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45mbnKb",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Dry and Compacted Soil",
                details: [
                  "The soil may be too dry and compacted, preventing water from penetrating.",
                ],
                solution:
                    "Aerate the soil and apply a soil wetting agent to improve moisture absorption.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 8
    SelfDiagnosisItem(
      id: "8",
      title:
          "Are there Dark Green Patches Surrounded by Lighter Grass in your Lawn?",
      imageUrl: "",
      questions: [
        Question(
          id: "8_a",
          question:
              "Do the dark green patches appear in small, irregular shapes?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "8_b"),
            Answer(
              text: "No, they are larger or form a pattern",
              nextQuestionId: "8_e",
            ),
          ],
        ),
        Question(
          id: "8_b",
          question:
              "Are the dark green patches appearing near pet urine spots?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pet Urine Damage",
                details: [
                  "Likely pet urine damage (excess nitrogen).",
                  "The high nitrogen concentration in pet urine causes dark green, fast-growing patches, often surrounded by yellow or brown edges.",
                ],
                solution:
                    "Water the area immediately after urination to dilute nitrogen. Apply a soil neutralizer if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NTqhBz",
              ),
            ),
            Answer(text: "No", nextQuestionId: "8_c"),
          ],
        ),
        Question(
          id: "8_c",
          question:
              "Are the dark green patches growing faster than the rest of the lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Uneven Fertilizer Application",
                details: [
                  "Likely fertilizer spill or uneven fertilizer application.",
                  "Over-fertilized areas grow darker and faster than the rest of the lawn.",
                ],
                solution:
                    "Lightly water the area to distribute nutrients more evenly. Use a lawn spreader for uniform fertilizer application in the future.",
                affiliateTitle: "Get Product",
                affiliateLink:
                    "https://shareasale.com/r.cfm?b=2583073&u=3538080&m=43235&urllink=&afftrack=",
              ),
            ),
            Answer(text: "No", nextQuestionId: "8_d"),
          ],
        ),
        Question(
          id: "8_d",
          question:
              "Are the dark green patches appearing in compacted areas or along walkways/driveways?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Soil Compaction",
                details: [
                  "Likely soil compaction causing nutrient and water retention in certain areas.",
                ],
                solution:
                    "Aerate the compacted areas and apply organic matter to balance soil nutrients.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Excess Moisture",
                details: ["The issue may be excess moisture in certain areas."],
                solution: "Reduce watering and check for drainage issues.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
          ],
        ),
        Question(
          id: "8_e",
          question:
              "Do the dark green patches appear in a circular or ring shape?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "8_f"),
            Answer(text: "No", nextQuestionId: "8_g"),
          ],
        ),
        Question(
          id: "8_f",
          question: "Do the circles have mushrooms or a ring of darker grass?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fairy Ring",
                details: [
                  "Likely Fairy Ring (a soil fungus).",
                  "Some Fairy Rings cause dark green, fast-growing grass due to fungal activity in the soil.",
                ],
                solution:
                    "Aerate deeply and apply a wetting agent to help nutrients reach the soil.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Necrotic Ring Spot or Summer Patch",
                details: [
                  "Could be Necrotic Ring Spot or Summer Patch, both fungal diseases that can cause green rings before turning brown.",
                ],
                solution:
                    "Apply a fungicide and overseed with disease-resistant grass.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sGC9qC",
              ),
            ),
          ],
        ),
        Question(
          id: "8_g",
          question:
              "Are the dark green patches appearing near objects, like under a tree, next to a wall, or near a structure?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Microclimate Effects",
                details: [
                  "Likely microclimate effects (shading, heat retention, or root competition).",
                ],
                solution:
                    "Adjust watering to accommodate shade differences or apply shade-tolerant grass seed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sGC9qC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "8_h"),
          ],
        ),
        Question(
          id: "8_h",
          question:
              "Have the dark green patches appeared after dethatching or aerating?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Improved Aeration",
                details: [
                  "Likely increased oxygen and nutrient availability in aerated areas.",
                ],
                solution:
                    "Continue aerating annually to improve lawn health overall.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Nutrient Imbalance",
                details: ["The issue may be nutrient imbalance in the soil."],
                solution:
                    "Apply a soil test kit to determine deficiencies and correct them with proper fertilization.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LspWVY",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 9
    SelfDiagnosisItem(
      id: "9",
      title: "Do You Have Rust-Colored Dust on Grass?",
      imageUrl: "",
      questions: [
        Question(
          id: "9_a",
          question:
              "Does the rust-colored dust come off when you rub the grass blades?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "9_b"),
            Answer(
              text: "No, the grass is discolored but no dust rubs off",
              nextQuestionId: "9_e",
            ),
          ],
        ),
        Question(
          id: "9_b",
          question:
              "Is the discoloration spreading across the lawn, especially in shaded or stressed areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Rust Disease",
                details: [
                  "Likely Rust Disease (Puccinia spp.), a fungal infection.",
                  "Rust spreads in warm, humid conditions and is more common in under-fertilized lawns.",
                  "The orange or reddish spores rub off easily on hands, shoes, or mowers.",
                ],
                solution:
                    "Apply a nitrogen-rich fertilizer to boost lawn growth and mow frequently to remove infected blades. Apply a fungicide if severe.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3ZolDOw",
              ),
            ),
            Answer(text: "No", nextQuestionId: "9_c"),
          ],
        ),
        Question(
          id: "9_c",
          question:
              "Does the rust-like discoloration appear after mowing, especially on older grass blades?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Dull Mower Blades",
                details: ["Likely dull mower blades spreading fungal spores."],
                solution:
                    "Sharpen mower blades and bag clippings to prevent spore spread.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NBmdWA",
              ),
            ),
            Answer(text: "No", nextQuestionId: "9_d"),
          ],
        ),
        Question(
          id: "9_d",
          question: "Has the lawn been watered frequently but not deeply?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Shallow Root Growth",
                details: [
                  "Likely shallow root growth and lawn stress making it more susceptible to rust disease.",
                ],
                solution:
                    "Water deeply (1 inch per week) and in the morning to allow drying before night. Avoid frequent shallow watering.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pQB6BV",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Poor Airflow",
                details: ["The issue may be poor airflow in the lawn."],
                solution:
                    "Aerate the lawn to improve air circulation and reduce moisture buildup.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
          ],
        ),
        Question(
          id: "9_e",
          question:
              "Are the rust-colored areas accompanied by yellowing grass blades?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency",
                details: ["Likely nutrient deficiency (low nitrogen or iron)."],
                solution:
                    "Apply a slow-release nitrogen fertilizer and iron supplement to restore color.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jL3Z0M",
              ),
            ),
            Answer(text: "No", nextQuestionId: "9_f"),
          ],
        ),
        Question(
          id: "9_f",
          question:
              "Are the rust-colored areas appearing mainly in shaded or damp areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fungal Issue",
                details: [
                  "Likely a fungal issue worsened by lack of sunlight and airflow.",
                ],
                solution:
                    "Trim trees/shrubs for more sunlight and mow at 3-inch height for better airflow. Apply fungicide if severe.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NDI8fM",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Environmental Stress",
                details: [
                  "The issue may be environmental stress (temperature changes, soil pH imbalance).",
                ],
                solution:
                    "Perform a soil test to check for deficiencies and adjust pH accordingly.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LspWVY",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 10
    SelfDiagnosisItem(
      id: "10",
      title: "Do you Have Jagged or Chewed Grass Blades?",
      imageUrl: "",
      questions: [
        Question(
          id: "10_a",
          question:
              "Are the jagged or chewed grass blades appearing consistently after mowing?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "10_b"),
            Answer(
              text: "No, it happens randomly or overnight",
              nextQuestionId: "10_d",
            ),
          ],
        ),
        Question(
          id: "10_b",
          question:
              "Do the grass tips look frayed or torn rather than cleanly cut?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Dull Mower Blades",
                details: [
                  "Likely dull mower blades tearing the grass.",
                  "Torn grass blades lose moisture faster and are more prone to disease and stress.",
                ],
                solution:
                    "Sharpen mower blades and avoid mowing when grass is wet.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NBmdWA",
              ),
            ),
            Answer(text: "No", nextQuestionId: "10_c"),
          ],
        ),
        Question(
          id: "10_c",
          question: "Are you mowing the lawn too short (scalping)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mowing Stress",
                details: ["Likely mowing stress causing damage to grass tips."],
                solution:
                    "Raise your mower height to at least 3 inches to avoid weakening the lawn.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NDN2cF",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Improper Mowing Technique",
                details: [
                  "The jagged blades may be caused by mechanical damage from improper mowing technique.",
                ],
                solution:
                    "Mow in alternating patterns to prevent stressing the same areas.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
          ],
        ),
        Question(
          id: "10_d",
          question:
              "Do you notice small, irregular bite marks or holes on the grass blades?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "10_e"),
            Answer(
              text: "No, the damage appears as shredded or clipped blades",
              nextQuestionId: "10_g",
            ),
          ],
        ),
        Question(
          id: "10_e",
          question:
              "Are there small insects visible on the grass when you disturb it?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Insect Pests",
                details: [
                  "Likely insect pests (armyworms, sod webworms, cutworms).",
                  "Armyworms & sod webworms chew on grass blades, often leaving scalloped edges.",
                  "Damage is worse in warm, dry conditions and may spread quickly.",
                ],
                solution:
                    "Apply a lawn insecticide labeled for armyworms & sod webworms. Water the area lightly after application.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45VJjxt",
              ),
            ),
            Answer(text: "No", nextQuestionId: "10_f"),
          ],
        ),
        Question(
          id: "10_f",
          question:
              "Do you see irregular patches of missing grass along with the chewed blades?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Rabbit or Rodent Damage",
                details: [
                  "Likely rabbit or rodent damage.",
                  "Rabbits, voles, and other small animals clip grass blades and may leave trails or droppings.",
                ],
                solution:
                    "Use animal repellents or install a temporary barrier around affected areas.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4b8Wqih",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Early Grub Damage",
                details: [
                  "The problem may be early grub damage, which weakens the lawn, making it more vulnerable to chewing pests.",
                ],
                solution:
                    "Apply grub control if you notice other signs of grub activity (loose grass, brown patches).",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45VJjxt",
              ),
            ),
          ],
        ),
        Question(
          id: "10_g",
          question:
              "Are the jagged grass blades appearing after rain or watering?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fungal Disease",
                details: ["Likely fungal disease causing blade weakening."],
                solution:
                    "Apply a fungicide and improve airflow by aerating the soil.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49MXAh9",
              ),
            ),
            Answer(text: "No", nextQuestionId: "10_h"),
          ],
        ),
        Question(
          id: "10_h",
          question: "Are the jagged edges mainly on new growth (young blades)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency",
                details: [
                  "Likely nutrient deficiency (lack of potassium or phosphorus) weakening the blades.",
                ],
                solution:
                    "Apply a balanced fertilizer with potassium & phosphorus.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qw6dDZ",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Mechanical Stress",
                details: [
                  "The damage may be from mechanical stress (heavy foot traffic or pets running over the grass).",
                ],
                solution:
                    "Reduce stress by creating designated walkways and limiting heavy use on the lawn.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pQXV8G",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 11
    SelfDiagnosisItem(
      id: "11",
      title: "Do You Have Mushrooms or Fungal Growth in Your Lawn?",
      imageUrl: "",
      questions: [
        Question(
          id: "11_a",
          question:
              "Are the mushrooms appearing in a circular pattern (a ring or arc)?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "11_b"),
            Answer(
              text: "No, they are scattered or in clusters",
              nextQuestionId: "11_d",
            ),
          ],
        ),
        Question(
          id: "11_b",
          question:
              "Is the grass inside or around the ring darker green than the surrounding lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fairy Ring",
                details: [
                  "Likely Fairy Ring, a fungal condition where fungus in the soil releases nitrogen, making grass greener inside the ring.",
                ],
                solution:
                    "Aerate deeply, remove dead organic material, and apply a wetting agent to help break down fungal buildup.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "11_c"),
          ],
        ),
        Question(
          id: "11_c",
          question: "Does the grass inside the ring turn brown or die?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Severe Fairy Ring",
                details: [
                  "Likely a severe Fairy Ring infection where fungus creates a water-repellent layer in the soil.",
                ],
                solution:
                    "Aerate, apply a wetting agent, and use a fungicide if necessary. Deep watering can help break up the hydrophobic soil layer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Mild Fungal Condition",
                details: [
                  "The issue may still be a fungal condition but not severe.",
                ],
                solution: "Maintain proper aeration and deep watering.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
          ],
        ),
        Question(
          id: "11_d",
          question:
              "Are the mushrooms growing after heavy rain or frequent watering?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Excess Moisture",
                details: ["Likely excess moisture causing fungal growth."],
                solution:
                    "Reduce watering, improve drainage, and rake/remove mushrooms to prevent spore spread.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "11_e"),
          ],
        ),
        Question(
          id: "11_e",
          question:
              "Are the mushrooms appearing in areas with decaying tree roots, stumps, or buried wood?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Organic Decomposition",
                details: [
                  "Likely organic decomposition feeding fungal growth.",
                ],
                solution:
                    "Remove rotting wood if possible, and apply a nitrogen-based fertilizer to accelerate decomposition.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "11_f"),
          ],
        ),
        Question(
          id: "11_f",
          question:
              "Are the mushrooms appearing in shaded areas with compacted soil?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Shade-Loving Fungi",
                details: [
                  "Likely shade-loving fungi thriving in low-light, moist conditions.",
                ],
                solution:
                    "Prune trees/shrubs to allow sunlight and aerate the soil to improve air circulation.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "11_g"),
          ],
        ),
        Question(
          id: "11_g",
          question:
              "Are there any white, moldy patches or slimy textures near the mushrooms?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Slime Mold or Fungal Disease",
                details: ["Likely Slime Mold or other fungal disease."],
                solution:
                    "Rake affected areas, improve drainage, and apply a fungicide if spreading persists.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Harmless Mushroom Growth",
                details: [
                  "The issue may be harmless mushroom growth due to high soil moisture and organic material.",
                ],
                solution:
                    "Manually remove mushrooms, reduce watering, and encourage more air circulation.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 12
    SelfDiagnosisItem(
      id: "12",
      title: "Is Your Lawn Grass Turning Purple or Reddish?",
      imageUrl: "",
      questions: [
        Question(
          id: "12_a",
          question:
              "Is the discoloration affecting entire patches of the lawn?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "12_b"),
            Answer(
              text:
                  "No, it appears on individual grass blades or scattered areas",
              nextQuestionId: "12_e",
            ),
          ],
        ),
        Question(
          id: "12_b",
          question: "Has the weather been cold recently, especially at night?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Cold Stress or Dormancy",
                details: [
                  "Likely cold stress or seasonal dormancy.",
                  "Cool-season grasses may turn purple or reddish in cold temperatures.",
                ],
                solution:
                    "No treatment needed—grass will recover when temperatures rise. If necessary, apply a light nitrogen fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4jL3Z0M",
              ),
            ),
            Answer(text: "No", nextQuestionId: "12_c"),
          ],
        ),
        Question(
          id: "12_c",
          question:
              "Are the reddish or purple patches appearing in irregular shapes?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Red Thread Disease",
                details: [
                  "Likely Red Thread Disease, a fungal infection.",
                  "Appears as reddish-pink strands or threads on grass blades.",
                ],
                solution:
                    "Apply a nitrogen fertilizer to encourage new growth and mow to remove infected blades. Use a fungicide if severe.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sUx91S",
              ),
            ),
            Answer(text: "No", nextQuestionId: "12_d"),
          ],
        ),
        Question(
          id: "12_d",
          question:
              "Do the purple or red patches have a water-soaked or slimy appearance?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pink Snow Mold or Fusarium Patch",
                details: [
                  "Likely Pink Snow Mold (in cold conditions) or Fusarium Patch (in wet conditions).",
                ],
                solution:
                    "Apply a fungicide, improve drainage, and avoid overwatering.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LDZE36",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency or Stress",
                details: [
                  "Could be nutrient deficiency or stress from environmental factors.",
                ],
                solution:
                    "Perform a soil test and apply a balanced fertilizer with phosphorus & potassium.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LspWVY",
              ),
            ),
          ],
        ),
        Question(
          id: "12_e",
          question:
              "Is the reddish or purple discoloration concentrated on the tips of the grass blades?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mowing Stress",
                details: [
                  "Likely mowing stress or dull mower blades tearing the grass.",
                ],
                solution:
                    "Sharpen mower blades and mow at a higher setting (3 inches or more) to reduce stress.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4m6Ib0H",
              ),
            ),
            Answer(text: "No", nextQuestionId: "12_f"),
          ],
        ),
        Question(
          id: "12_f",
          question:
              "Have you noticed yellowing along with the purple or red coloring?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Phosphorus Deficiency",
                details: [
                  "Likely phosphorus deficiency.",
                  "Grass can turn purple or red when lacking phosphorus.",
                ],
                solution:
                    "Apply a phosphorus-rich fertilizer to improve root strength and color.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qvul9E",
              ),
            ),
            Answer(text: "No", nextQuestionId: "12_g"),
          ],
        ),
        Question(
          id: "12_g",
          question:
              "Are the reddish or purple areas forming near compacted soil or high-traffic zones?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Compaction Stress",
                details: [
                  "Likely compaction stress preventing proper nutrient absorption.",
                ],
                solution:
                    "Aerate the lawn to relieve soil compaction and encourage deeper root growth.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Environmental Stress",
                details: [
                  "The discoloration may be a reaction to environmental stressors like drought or extreme temperature swings.",
                ],
                solution:
                    "Monitor watering habits and apply a balanced fertilizer to support recovery.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YSQIK6",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 13
    SelfDiagnosisItem(
      id: "13",
      title: "Is Your Grass Blades Curling or Wilting?",
      imageUrl: "",
      questions: [
        Question(
          id: "13_a",
          question:
              "Are the curling or wilting blades widespread across the lawn?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "13_b"),
            Answer(
              text: "No, it’s in isolated spots or certain areas",
              nextQuestionId: "13_e",
            ),
          ],
        ),
        Question(
          id: "13_b",
          question: "Has the lawn experienced hot, dry weather recently?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Drought Stress",
                details: [
                  "Likely drought stress.",
                  "Grass curls and wilts when it loses moisture faster than it can replace.",
                ],
                solution:
                    "Water deeply (1 inch per week, early morning) and apply a moisture-retaining soil additive.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4bG6dwn",
              ),
            ),
            Answer(text: "No", nextQuestionId: "13_c"),
          ],
        ),
        Question(
          id: "13_c",
          question:
              "Do the blades curl upward, with tips turning brown or crispy?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Heat Stress or Wind Desiccation",
                details: ["Likely heat stress or wind desiccation."],
                solution:
                    "Increase mowing height to at least 3 inches and water deeply 2–3 times per week. Avoid mowing during midday heat.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4bG6dwn",
              ),
            ),
            Answer(text: "No", nextQuestionId: "13_d"),
          ],
        ),
        Question(
          id: "13_d",
          question: "Do the curled blades have a bluish or grayish tint?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Entering Dormancy",
                details: ["Grass is entering dormancy due to drought stress."],
                solution:
                    "Water deeply to encourage root recovery. Consider using a drought-resistant fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4bG6dwn",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Compacted Soil",
                details: [
                  "The issue may be compacted soil preventing roots from absorbing water.",
                ],
                solution: "Aerate the soil to improve water infiltration.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
          ],
        ),
        Question(
          id: "13_e",
          question: "Are the curling blades appearing in circular patches?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "13_f"),
            Answer(
              text: "No",
              nextQuestionId:
                  "13_g", // Jump to g (Question 7 in logic list? No 13_g matches Q7 in text "Are curling blades only affecting new growth")
              // Let's check text logic for 13_e No -> Go to Q7.
              // Q7 text is "Are the curling blades only affecting new growth...?"
              // So Yes -> Next (13_f), No -> 13_g. Correct.
            ),
          ],
        ),
        Question(
          id: "13_f",
          question: "Do the affected patches have a pinkish or reddish hue?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Red Thread or Pink Patch Disease",
                details: ["Likely Red Thread or Pink Patch Disease."],
                solution:
                    "Apply a nitrogen-rich fertilizer and, if severe, a fungicide.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sUx91S",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Root Rot",
                details: [
                  "The patches may be caused by root rot from overwatering.",
                ],
                solution:
                    "Reduce watering and apply a fungicide if roots are affected.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LDZE36",
              ),
            ),
          ],
        ),
        Question(
          id: "13_g",
          question:
              "Are the curling blades only affecting new growth (younger, softer blades)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency",
                details: [
                  "Likely nutrient deficiency (potassium or phosphorus).",
                ],
                solution:
                    "Apply a balanced fertilizer with potassium & phosphorus.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qpbTj0",
              ),
            ),
            Answer(text: "No", nextQuestionId: "13_h"),
          ],
        ),
        Question(
          id: "13_h",
          question:
              "Do the curled blades have tiny bite marks or frayed edges?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pest Damage",
                details: [
                  "Likely pest damage (thrips, mites, or leafhoppers).",
                ],
                solution: "Apply a broad-spectrum lawn insecticide.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45VJjxt",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Mowing Stress or Nitrogen Overload",
                details: [
                  "The curling may be due to mowing stress or excessive nitrogen fertilizer.",
                ],
                solution:
                    "Raise mowing height and water consistently to prevent nitrogen overload.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 14
    SelfDiagnosisItem(
      id: "14",
      title: "Are Weeds Taking Over the Lawn?",
      imageUrl: "",
      questions: [
        Question(
          id: "14_a",
          question: "Are the weeds evenly spread throughout the lawn?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "14_b"),
            Answer(
              text: "No, they are concentrated in patches or specific areas",
              nextQuestionId: "14_e",
            ),
          ],
        ),
        Question(
          id: "14_b",
          question:
              "Is the lawn thin or patchy, allowing weeds to grow easily?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Poor Lawn Density",
                details: ["Likely poor lawn density allowing weed invasion."],
                solution:
                    "Overseed with high-quality grass seed and apply a starter fertilizer to promote thicker grass growth.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49FwVnP",
              ),
            ),
            Answer(text: "No", nextQuestionId: "14_c"),
          ],
        ),
        Question(
          id: "14_c",
          question: "Has the lawn been mowed too short (scalped)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mowing Stress",
                details: ["Likely mowing stress creating space for weeds."],
                solution:
                    "Raise mower height to 3 inches or more to help grass outcompete weeds.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4ba7wDU",
              ),
            ),
            Answer(text: "No", nextQuestionId: "14_d"),
          ],
        ),
        Question(
          id: "14_d",
          question: "Have you fertilized the lawn within the past 6-8 weeks?",
          answers: [
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Nutrient Deficiency",
                details: [
                  "Likely nutrient deficiency weakening the lawn, allowing weeds to invade.",
                ],
                solution:
                    "Apply a balanced lawn fertilizer with nitrogen to promote strong grass growth.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pSgk51",
              ),
            ),
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Persistent Weeds",
                details: [
                  "The weeds may be naturally persistent species requiring targeted treatment.",
                ],
                solution:
                    "Apply a selective weed killer to remove broadleaf weeds while protecting the lawn.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LmQzvu",
              ),
            ),
          ],
        ),
        Question(
          id: "14_e",
          question:
              "Are the weeds mostly broadleaf (dandelions, clover, plantain, etc.)?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "14_f"),
            Answer(
              text: "No, they are grassy weeds (crabgrass, foxtail, etc.)",
              nextQuestionId: "14_g",
            ),
          ],
        ),
        Question(
          id: "14_f",
          question: "Are the broadleaf weeds forming in nutrient-poor areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Low Soil Fertility",
                details: ["Likely low soil fertility encouraging weed growth."],
                solution:
                    "Apply a broadleaf weed killer and fertilize to boost grass strength.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LmQzvu",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Weed Seeds in Soil",
                details: ["Likely weed seeds in soil from previous seasons."],
                solution:
                    "Apply a pre-emergent weed preventer in early spring and fall.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qYgOap",
              ),
            ),
          ],
        ),
        Question(
          id: "14_g",
          question:
              "Are the grassy weeds appearing in early spring and spreading rapidly?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Crabgrass",
                details: ["Likely crabgrass or annual grassy weeds."],
                solution:
                    "Apply a crabgrass pre-emergent in early spring to prevent germination.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qYgOap",
              ),
            ),
            Answer(text: "No", nextQuestionId: "14_h"),
          ],
        ),
        Question(
          id: "14_h",
          question:
              "Are the weeds growing in areas with compacted soil or poor drainage?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Compacted Soil",
                details: ["Likely compacted soil favoring weeds over grass."],
                solution:
                    "Aerate the lawn and top-dress with organic material to improve soil quality.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Perennial Grassy Weeds",
                details: [
                  "The weeds may be perennial grassy weeds (like quackgrass or dallisgrass) that require targeted removal.",
                ],
                solution:
                    "Apply a selective herbicide for grassy weeds or spot-treat with a non-selective herbicide if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49H0cNr",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 15
    SelfDiagnosisItem(
      id: "15",
      title: "Do You Have Uneven Lawn Growth?",
      imageUrl: "",
      questions: [
        Question(
          id: "15_a",
          question:
              "Are the faster-growing patches noticeably greener than the rest of the lawn?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "15_b"),
            Answer(
              text: "No, they are just taller but not necessarily greener",
              nextQuestionId: "15_e",
            ),
          ],
        ),
        Question(
          id: "15_b",
          question:
              "Are the greener, faster-growing patches appearing where pets frequently urinate?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pet Urine Spots",
                details: ["Likely pet urine spots providing excess nitrogen."],
                solution:
                    "Water the area immediately after pet urination to dilute nitrogen. Apply a soil neutralizer if necessary.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49Jx0Wa",
              ),
            ),
            Answer(text: "No", nextQuestionId: "15_c"),
          ],
        ),
        Question(
          id: "15_c",
          question:
              "Do the greener patches appear in areas where fertilizer may have been spilled or applied unevenly?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Uneven Fertilizer Distribution",
                details: ["Likely uneven fertilizer distribution."],
                solution:
                    "Water lightly to help blend nutrients and use a calibrated spreader for even application in the future.",
                affiliateTitle: "Get Product",
                affiliateLink:
                    "https://shareasale.com/r.cfm?b=2583073&u=3538080&m=43235&urllink=&afftrack=",
              ),
            ),
            Answer(text: "No", nextQuestionId: "15_d"),
          ],
        ),
        Question(
          id: "15_d",
          question:
              "Are the greener areas near buried organic material, like tree roots or old compost piles?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Natural Decomposition",
                details: [
                  "Likely natural decomposition releasing nitrogen into the soil.",
                ],
                solution:
                    "Even out the growth by applying a balanced slow-release fertilizer across the entire lawn.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45kkye6",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Nutrient Imbalances",
                details: ["The issue may be soil nutrient imbalances."],
                solution:
                    "Perform a soil test to determine deficiencies and apply the appropriate fertilizer.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49ufQgq",
              ),
            ),
          ],
        ),
        Question(
          id: "15_e",
          question: "Are the taller-growing patches located in shady areas?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Shade-Adapted Growth",
                details: [
                  "Likely shade-adapted growth patterns.",
                  "Grass in shaded areas tends to grow taller to reach sunlight but may be thinner and weaker.",
                ],
                solution:
                    "Overseed with shade-tolerant grass seed and mow slightly higher in shaded areas.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sQZKF2",
              ),
            ),
            Answer(text: "No", nextQuestionId: "15_f"),
          ],
        ),
        Question(
          id: "15_f",
          question:
              "Are the uneven growth patches appearing after aeration, dethatching, or lawn repairs?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Temporary Regrowth Differences",
                details: [
                  "Likely temporary regrowth differences from soil disruption.",
                ],
                solution:
                    "Allow 3-4 weeks for lawn to even out, and apply a light nitrogen fertilizer to promote uniform growth.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4b4T8g0",
              ),
            ),
            Answer(text: "No", nextQuestionId: "15_g"),
          ],
        ),
        Question(
          id: "15_g",
          question:
              "Are the uneven growth areas forming in compacted or heavily trafficked sections of the lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Soil Compaction",
                details: [
                  "Likely soil compaction restricting root growth in some areas.",
                ],
                solution:
                    "Aerate compacted areas and top-dress with organic material to improve soil structure.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "15_h"),
          ],
        ),
        Question(
          id: "15_h",
          question:
              "Are the fast-growing patches forming in areas that stay wetter longer after rain or irrigation?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Excess Moisture",
                details: [
                  "Likely excess moisture causing grass to grow more vigorously in those spots.",
                ],
                solution:
                    "Adjust irrigation settings for even water distribution and improve drainage if necessary.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Grass Variety Differences",
                details: ["The problem may be grass variety differences."],
                solution:
                    "Overseed the lawn with a uniform grass seed mix to blend different growth rates.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qBNuXC",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 16
    SelfDiagnosisItem(
      id: "16",
      title: "Do You Have a Powdery or Grayish Coating on Grass?",
      imageUrl: "",
      questions: [
        Question(
          id: "16_a",
          question:
              "Does the powdery or grayish coating easily rub off when you touch the grass?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "16_b"),
            Answer(
              text: "No, it seems embedded in the blades",
              nextQuestionId: "16_e",
            ),
          ],
        ),
        Question(
          id: "16_b",
          question:
              "Is the coating mostly on the upper surface of grass blades, giving them a dusty or flour-like appearance?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Powdery Mildew",
                details: [
                  "Likely Powdery Mildew (Erysiphe graminis), a fungal infection.",
                  "Common in shady, humid areas with poor air circulation.",
                ],
                solution:
                    "Trim surrounding vegetation to allow sunlight, improve airflow, and apply a fungicide if severe.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45QZ096",
              ),
            ),
            Answer(text: "No", nextQuestionId: "16_c"),
          ],
        ),
        Question(
          id: "16_c",
          question:
              "Does the grayish coating form in circular patches and appear slimy when wet?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Slime Mold",
                details: ["Likely Slime Mold, a harmless fungal organism."],
                solution:
                    "No chemical treatment needed—rake or hose off the mold and improve airflow in the lawn.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4b3R6wF",
              ),
            ),
            Answer(text: "No", nextQuestionId: "16_d"),
          ],
        ),
        Question(
          id: "16_d",
          question:
              "Has the lawn been frequently wet due to excessive rain or overwatering?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fungal Issue",
                details: ["Likely a fungal issue caused by excess moisture."],
                solution:
                    "Reduce watering frequency, mow at a higher setting, and apply a fungicide if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45QZ096",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Nutrient Related",
                details: ["The problem may be nutrient-related."],
                solution:
                    "Perform a soil test to check for imbalances and apply a balanced fertilizer if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49KNKfL",
              ),
            ),
          ],
        ),
        Question(
          id: "16_e", // Mapped from 'h'
          question:
              "Is the grayish tint mostly appearing on the lower parts of the blades, near the soil?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pythium Blight",
                details: [
                  "Likely Pythium Blight, a serious fungal disease.",
                  "Often occurs in hot, humid weather when drainage is poor.",
                ],
                solution:
                    "Apply a fungicide, improve drainage, and reduce evening watering.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49Nsqq3",
              ),
            ),
            Answer(
              text: "No",
              nextQuestionId:
                  "16_f", // User text says "Go to Q6", mapping to next logical subQuestion
            ),
          ],
        ),
        Question(
          id: "16_f", // Mapped from 'i'
          question:
              "Are the affected grass blades turning yellow or brown along with the coating?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Gray Leaf Spot Disease",
                details: [
                  "Likely Gray Leaf Spot Disease, another fungal infection.",
                ],
                solution:
                    "Reduce lawn stress, apply a fungicide, and avoid nitrogen-heavy fertilizers.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sGK33g",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Soil Issues or Environmental Stress",
                details: [
                  "The coating may be caused by soil issues or environmental stress.",
                ],
                solution:
                    "Aerate the lawn, top-dress with compost, and ensure proper watering habits.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3EHFu4y",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 17
    SelfDiagnosisItem(
      id: "17",
      title: "Is There Small Mounds of Dirt Appearing in the Lawn?",
      imageUrl: "",
      questions: [
        Question(
          id: "17_a",
          question:
              "Are the mounds made of fine, loose soil with a small hole in the center?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "17_b"),
            Answer(
              text:
                  "No, the mounds are irregular or do not have a visible hole",
              nextQuestionId: "17_e",
            ),
          ],
        ),
        Question(
          id: "17_b",
          question:
              "Are the mounds about the size of a golf ball to a baseball and appearing randomly?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Earthworm Activity",
                details: [
                  "Likely earthworm activity, which is beneficial for soil health.",
                ],
                solution:
                    "No treatment needed—rake the mounds flat to maintain lawn appearance.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45p8qsq",
              ),
            ),
            Answer(text: "No", nextQuestionId: "17_c"),
          ],
        ),
        Question(
          id: "17_c",
          question:
              "Are the mounds larger (3-6 inches wide) with raised tunnels visible nearby?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mole Activity",
                details: [
                  "Likely mole activity, as they create mounds while tunneling for grubs.",
                ],
                solution:
                    "Apply a mole repellent or trap and reduce grub populations.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YPqSGP",
              ),
            ),
            Answer(text: "No", nextQuestionId: "17_d"),
          ],
        ),
        Question(
          id: "17_d",
          question:
              "Do the small mounds appear in clusters, often near gardens or flower beds?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Burrowing Insects",
                details: [
                  "Likely burrowing insects (ants, cicada killers, digger wasps, etc.).",
                ],
                solution:
                    "Apply an insecticide targeted for burrowing pests and disrupt nests.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qvMuUL",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Gophers or Voles",
                details: [
                  "The issue may be gophers or voles, which create smaller dirt mounds than moles.",
                ],
                solution:
                    "Use gopher/vole repellents or traps to eliminate the problem.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3YPqSGP",
              ),
            ),
          ],
        ),
        Question(
          id: "17_e",
          question:
              "Are the mounds irregular in shape and scattered across the lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Disturbance from Rain/Wind",
                details: [
                  "Likely disturbance from heavy rain or wind pushing soil up.",
                ],
                solution:
                    "Rake the soil evenly and aerate the lawn to encourage soil settling.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45p8qsq",
              ),
            ),
            Answer(text: "No", nextQuestionId: "17_f"),
          ],
        ),
        Question(
          id: "17_f",
          question:
              "Do the mounds contain small pebbles, plant debris, or roots?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Nightcrawler or Worm Castings",
                details: [
                  "Likely nightcrawler or worm castings, which improve soil aeration but may be unsightly.",
                ],
                solution:
                    "Lightly rake to break down castings and maintain a healthy soil balance.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45p8qsq",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Soil Upheaval",
                details: [
                  "The problem may be soil upheaval from frost heaving in colder months.",
                ],
                solution:
                    "Allow natural settling in spring, and overseed to repair any bare patches.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45QFJ7M",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 18
    SelfDiagnosisItem(
      id: "18",
      title: "Are There Sticky or Slimy Patches on the Lawn?",
      imageUrl: "",
      questions: [
        Question(
          id: "18_a",
          question:
              "Do the slimy patches appear black, dark green, or have a jelly-like texture?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "18_b"),
            Answer(
              text: "No, the patches feel sticky but not jelly-like",
              nextQuestionId: "18_e", // User said Q5, mapped to e
            ),
          ],
        ),
        Question(
          id: "18_b",
          question:
              "Do the slimy patches appear after heavy rain or prolonged moisture?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Cyanobacteria (Nostoc Algae)",
                details: [
                  "Likely cyanobacteria (Nostoc algae), a water-retaining bacterial colony that forms on compacted or waterlogged soil.",
                ],
                solution:
                    "Improve lawn drainage and aeration, and apply a soil conditioner to reduce compaction.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4r3Dfez",
              ),
            ),
            Answer(text: "No", nextQuestionId: "18_c"),
          ],
        ),
        Question(
          id: "18_c",
          question:
              "Do the slimy patches appear in shaded areas with poor airflow?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Slime Mold",
                details: [
                  "Likely slime mold, a fungal-like organism that thrives in damp, shady spots.",
                ],
                solution:
                    "Rake or mow the area to break up the mold, improve airflow, and reduce excess moisture.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(text: "No", nextQuestionId: "18_d"),
          ],
        ),
        Question(
          id: "18_d",
          question: "Do the slimy patches smell bad or feel mushy underfoot?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Anaerobic Soil Conditions",
                details: [
                  "Likely anaerobic soil conditions due to overwatering or poor drainage.",
                ],
                solution:
                    "Reduce watering, aerate, and apply organic matter to improve soil health.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4r3Dk1R",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Fungal Disease",
                details: [
                  "The problem may be fungal disease causing excess moisture retention.",
                ],
                solution: "Apply a fungicide and adjust watering practices.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sGK33g",
              ),
            ),
          ],
        ),
        Question(
          id: "18_e",
          question:
              "Are the sticky areas appearing after mowing or walking through the lawn?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Honeydew from Insects",
                details: [
                  "Likely honeydew from aphids or scale insects on surrounding trees or shrubs.",
                ],
                solution:
                    "Inspect nearby plants for insects and apply an insecticide if necessary.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qvMuUL",
              ),
            ),
            Answer(text: "No", nextQuestionId: "18_f"),
          ],
        ),
        Question(
          id: "18_f",
          question:
              "Do the sticky patches coincide with thick, matted grass that’s difficult to mow?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Excess Thatch Buildup",
                details: [
                  "Likely excess thatch buildup causing moisture retention.",
                ],
                solution:
                    "Dethatch the lawn using a thatch rake or power dethatcher.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4b3R6wF",
              ),
            ),
            Answer(text: "No", nextQuestionId: "18_g"),
          ],
        ),
        Question(
          id: "18_g",
          question:
              "Are the sticky patches attracting insects or appear shiny when the sun hits them?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Tree Sap",
                details: ["Likely sap dripping from trees onto the lawn."],
                solution:
                    "Wash affected areas with water and check nearby trees for signs of insect infestation or disease.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qvMuUL",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Lawn Disease or Bacterial Growth",
                details: [
                  "The issue may be a lawn disease or bacterial growth due to excess moisture.",
                ],
                solution:
                    "Apply a fungicide, reduce watering, and improve air circulation.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45QZ096",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 19
    SelfDiagnosisItem(
      id: "19",
      title: "Is Your Scalped Lawn After Mowing?",
      imageUrl: "",
      questions: [
        Question(
          id: "19_a",
          question: "Is the lawn consistently cut too short after mowing?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "19_b"),
            Answer(
              text: "No, scalping happens only in certain areas",
              nextQuestionId: "19_e",
            ),
          ],
        ),
        Question(
          id: "19_b",
          question: "Is your mower set to cut below 2 inches?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mowing Too Low",
                details: [
                  "Likely mowing too low (scalping stress).",
                  "Cutting too short weakens grass, exposes soil to heat stress, and invites weeds.",
                ],
                solution:
                    "Raise the mower deck to 3 inches or higher, depending on grass type.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(text: "No", nextQuestionId: "19_c"),
          ],
        ),
        Question(
          id: "19_c",
          question: "Has the lawn been mowed during extreme heat or drought?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Heat Stress",
                details: [
                  "Likely heat stress making the grass more vulnerable to scalping.",
                ],
                solution:
                    "Mow early in the morning or evening, and avoid mowing during heat waves. Water deeply after scalping to encourage recovery.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4bG6dwn",
              ),
            ),
            Answer(text: "No", nextQuestionId: "19_d"),
          ],
        ),
        Question(
          id: "19_d",
          question:
              "Do the grass blades look torn or frayed instead of cleanly cut?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Dull Mower Blades",
                details: [
                  "Likely dull mower blades tearing the grass instead of cutting it.",
                ],
                solution:
                    "Sharpen mower blades every 4–6 weeks during mowing season.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3NTEdLT",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Thatch Buildup",
                details: [
                  "The issue may be too much thatch buildup causing uneven mowing.",
                ],
                solution: "Dethatch the lawn to allow a smoother cut.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4b3R6wF",
              ),
            ),
          ],
        ),
        Question(
          id: "19_e",
          question:
              "Are the scalped areas appearing on uneven or bumpy terrain?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Uneven Ground",
                details: [
                  "Likely lawn scalping due to mower deck bouncing on uneven ground.",
                ],
                solution:
                    "Level the lawn with topdressing and mow at a slower speed.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(text: "No", nextQuestionId: "19_f"),
          ],
        ),
        Question(
          id: "19_f",
          question:
              "Are the scalped areas forming near curves, slopes, or sharp turns?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Mower Wheels Sinking",
                details: ["Likely mower wheels sinking or tilting on slopes."],
                solution:
                    "Adjust mowing direction, use a push mower for slopes, or mow in longer, straight passes instead of tight turns.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(text: "No", nextQuestionId: "19_g"),
          ],
        ),
        Question(
          id: "19_g",
          question:
              "Are the scalped patches appearing more after recent heavy rain?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Soft Soil",
                details: [
                  "Likely soft soil causing mower wheels to sink and cut too low.",
                ],
                solution:
                    "Wait until the lawn dries before mowing, and aerate compacted areas.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Mower Deck Misalignment",
                details: [
                  "The scalping may be due to mower deck misalignment.",
                ],
                solution:
                    "Check and adjust the mower deck height evenly across all four wheels.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49ui7rY",
              ),
            ),
          ],
        ),
      ],
    ),
    // Question 20
    SelfDiagnosisItem(
      id: "20",
      title: "Is There an Unusual Odor Coming from the Soil?",
      imageUrl: "",
      questions: [
        Question(
          id: "20_a",
          question: "Does the odor resemble rotten eggs or sulfur?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "20_b"),
            Answer(
              text: "No, it smells musty, moldy, or like decay",
              nextQuestionId: "20_e",
            ),
          ],
        ),
        Question(
          id: "20_b",
          question: "Has the lawn been overly wet or recently flooded?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Anaerobic Soil",
                details: [
                  "Likely anaerobic soil conditions (lack of oxygen, leading to sulfur-smelling gases).",
                ],
                solution:
                    "Aerate the lawn, improve drainage, and reduce watering.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
            Answer(text: "No", nextQuestionId: "20_c"),
          ],
        ),
        Question(
          id: "20_c",
          question:
              "Are there visible dark, slimy patches or areas that remain soggy for long periods?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Pythium Root Rot",
                details: [
                  "Likely Pythium Root Rot or bacterial decay due to excessive moisture.",
                ],
                solution:
                    "Apply a fungicide, improve air circulation, and adjust watering practices.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4bJHtU1",
              ),
            ),
            Answer(text: "No", nextQuestionId: "20_d"),
          ],
        ),
        Question(
          id: "20_d",
          question:
              "Does the smell get worse when the soil is disturbed (e.g., digging, aerating, or heavy rainfall)?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Sulfur-Reducing Bacteria",
                details: [
                  "Likely sulfur-reducing bacteria breaking down organic material in compacted soil.",
                ],
                solution:
                    "Aerate the soil, apply gypsum or organic matter to balance soil chemistry.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pNj2Ze",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Stagnant Water",
                details: [
                  "The issue may be stagnant water trapped below the surface, causing decay.",
                ],
                solution:
                    "Improve lawn drainage and apply a liquid aerator if physical aeration isn’t possible.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4pNj2Ze",
              ),
            ),
          ],
        ),
        Question(
          id: "20_e",
          question: "Does the odor resemble mold, mildew, or dampness?",
          answers: [
            Answer(text: "Yes", nextQuestionId: "20_f"),
            Answer(
              text:
                  "No, it smells like rotting organic matter (compost, manure, or decaying roots)",
              nextQuestionId: "20_h", // User No -> Go to Q8
            ),
          ],
        ),
        Question(
          id: "20_f",
          question:
              "Are there visible patches of mold, mushrooms, or fungal growth on the soil?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Fungal Decomposition",
                details: ["Likely fungal decomposition of organic material."],
                solution:
                    "Rake the area to remove fungal buildup, improve airflow, and apply a fungicide if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4qCZ19g",
              ),
            ),
            Answer(text: "No", nextQuestionId: "20_g"),
          ],
        ),
        Question(
          id: "20_g",
          question:
              "Is the musty smell strongest in shady areas with poor airflow?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Moss, Algae, or Debris",
                details: [
                  "Likely moss, algae, or excessive organic debris breaking down in damp conditions.",
                ],
                solution:
                    "Trim trees or shrubs to allow more sunlight, and apply a moss/algae treatment if needed.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/4sUEoqA",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Soil-Borne Fungal Spores",
                details: [
                  "The issue may be soil-borne fungal spores thriving in humid conditions.",
                ],
                solution:
                    "Aerate and apply a biofungicide to rebalance soil microbes.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/45fWqJKn",
              ),
            ),
          ],
        ),
        Question(
          id: "20_h",
          question:
              "Has the lawn been recently treated with manure, compost, or organic fertilizers?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Natural Breakdown",
                details: [
                  "Likely natural breakdown of organic materials releasing gases.",
                ],
                solution:
                    "No action needed—odor should dissipate as decomposition continues. Water lightly to speed up breakdown.",
                affiliateTitle: "",
                affiliateLink: "",
              ),
            ),
            Answer(text: "No", nextQuestionId: "20_i"),
          ],
        ),
        Question(
          id: "20_i",
          question:
              "Are tree roots, stumps, or buried organic matter present in the affected area?",
          answers: [
            Answer(
              text: "Yes",
              diagnosis: Diagnosis(
                title: "Decomposing Roots",
                details: [
                  "Likely decomposing roots or tree matter releasing methane and decay odors.",
                ],
                solution:
                    "Excavate and remove rotting organic matter or apply a high-nitrogen fertilizer to accelerate decomposition.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/3LDIOBo",
              ),
            ),
            Answer(
              text: "No",
              diagnosis: Diagnosis(
                title: "Deep Soil Compaction",
                details: [
                  "The issue may be deep soil compaction preventing proper oxygen flow.",
                ],
                solution:
                    "Deep-tine aerate the lawn and apply a microbial soil treatment to rebalance the soil.",
                affiliateTitle: "Get Product",
                affiliateLink: "https://amzn.to/49yqItC",
              ),
            ),
          ],
        ),
      ],
    ),
  ];
}

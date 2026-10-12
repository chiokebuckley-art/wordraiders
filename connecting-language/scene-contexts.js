import {aiReviewComplete} from './review-policy.js';
// Editable story facts and deterministic geometry. AI-reviewed editable teaching aids; no educator certification.
export const sceneContexts={
  "CD-0007": {
    "senseId": "CD-0007",
    "content_version": 1,
    "term": "furthermore",
    "meaning": "Adds a further supporting point, formally.",
    "example": "The plan is simple. Furthermore, it is inexpensive.",
    "kind": "facts",
    "title": "Two facts about this plan",
    "facts": [
      [
        "Plan",
        "Two steps: choose the supplies, then assemble the card."
      ],
      [
        "Story prices",
        "This plan costs 2 tokens. A comparable plan for the same goal costs 10 tokens."
      ],
      [
        "Context",
        "The speaker describes this plan as simple and inexpensive in this story. These are supplied story facts, not properties measured from artwork."
      ]
    ],
    "relationship": "Furthermore adds the low-cost fact to the simple-plan fact. The comparison supplies the local meaning of inexpensive; it is not a universal price threshold.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0007.meaning-match.01",
      "CD-0007.example-match.01",
      "CD-0007.relationship-response.01",
      "CD-0007.compare-response.01",
      "CD-0007.transfer-response.01",
      "CD-0007.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"The plan is simple. Furthermore, it is inexpensive.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Plan\",\"Two steps: choose the supplies, then assemble the card.\"],[\"Story prices\",\"This plan costs 2 tokens. A comparable plan for the same goal costs 10 tokens.\"],[\"Context\",\"The speaker describes this plan as simple and inexpensive in this story. These are supplied story facts, not properties measured from artwork.\"]],\"kind\":\"facts\",\"meaning\":\"Adds a further supporting point, formally.\",\"question_ids\":[\"CD-0007.meaning-match.01\",\"CD-0007.example-match.01\",\"CD-0007.relationship-response.01\",\"CD-0007.compare-response.01\",\"CD-0007.transfer-response.01\",\"CD-0007.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Furthermore adds the low-cost fact to the simple-plan fact. The comparison supplies the local meaning of inexpensive; it is not a universal price threshold.\",\"senseId\":\"CD-0007\",\"term\":\"furthermore\",\"title\":\"Two facts about this plan\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-1-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "The plan’s two steps and2-versus10-token prices are declared fictional story facts. Simple is explicitly the speaker’s judgment; two steps alone need not prove simplicity. Furthermore adds a supporting low-cost point rather than causing simplicity. No prices or complexity are measured from raster.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0008": {
    "senseId": "CD-0008",
    "content_version": 1,
    "term": "moreover",
    "meaning": "Adds a point that strengthens what came before.",
    "example": "The bag is sturdy. Moreover, it is waterproof.",
    "kind": "facts",
    "title": "Two stated properties of one bag",
    "facts": [
      [
        "Same bag",
        "Both statements refer to the same bag."
      ],
      [
        "Sturdy",
        "The story says the bag holds its load without breaking."
      ],
      [
        "Waterproof",
        "The story says rain does not reach the contents. These property claims are supplied context, not a real product test."
      ]
    ],
    "relationship": "Moreover adds the waterproof property to the sturdy property. A rainy exterior alone does not prove either property.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0008.meaning-match.01",
      "CD-0008.example-match.01",
      "CD-0008.relationship-response.01",
      "CD-0008.compare-response.01",
      "CD-0008.transfer-response.01",
      "CD-0008.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"The bag is sturdy. Moreover, it is waterproof.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Same bag\",\"Both statements refer to the same bag.\"],[\"Sturdy\",\"The story says the bag holds its load without breaking.\"],[\"Waterproof\",\"The story says rain does not reach the contents. These property claims are supplied context, not a real product test.\"]],\"kind\":\"facts\",\"meaning\":\"Adds a point that strengthens what came before.\",\"question_ids\":[\"CD-0008.meaning-match.01\",\"CD-0008.example-match.01\",\"CD-0008.relationship-response.01\",\"CD-0008.compare-response.01\",\"CD-0008.transfer-response.01\",\"CD-0008.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Moreover adds the waterproof property to the sturdy property. A rainy exterior alone does not prove either property.\",\"senseId\":\"CD-0008\",\"term\":\"moreover\",\"title\":\"Two stated properties of one bag\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-1-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Sturdy and waterproof belong to the same explicitly identified bag; holding the load and dry contents are declared story properties. The panel correctly says a rainy exterior alone proves neither. Raster is omitted here; separate bag artwork still requires cutaway clarification before property-based questions.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0010": {
    "senseId": "CD-0010",
    "content_version": 1,
    "term": "what is more",
    "meaning": "Introduces an additional, often stronger point.",
    "example": "The park is free. What is more, it is nearby.",
    "kind": "facts",
    "title": "Entry cost and distance",
    "facts": [
      [
        "This park",
        "The park in the example is the same park in both statements."
      ],
      [
        "Entry",
        "Entry costs 0 tokens: it is free to enter in this story."
      ],
      [
        "Distance",
        "It is a short walk away: nearby in this story."
      ]
    ],
    "relationship": "What is more adds nearness to free entry. Nearby does not establish free entry; the two facts are separately stated.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0010.meaning-match.01",
      "CD-0010.example-match.01",
      "CD-0010.relationship-response.01",
      "CD-0010.compare-response.01",
      "CD-0010.transfer-response.01",
      "CD-0010.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"The park is free. What is more, it is nearby.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"This park\",\"The park in the example is the same park in both statements.\"],[\"Entry\",\"Entry costs 0 tokens: it is free to enter in this story.\"],[\"Distance\",\"It is a short walk away: nearby in this story.\"]],\"kind\":\"facts\",\"meaning\":\"Introduces an additional, often stronger point.\",\"question_ids\":[\"CD-0010.meaning-match.01\",\"CD-0010.example-match.01\",\"CD-0010.relationship-response.01\",\"CD-0010.compare-response.01\",\"CD-0010.transfer-response.01\",\"CD-0010.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"What is more adds nearness to free entry. Nearby does not establish free entry; the two facts are separately stated.\",\"senseId\":\"CD-0010\",\"term\":\"what is more\",\"title\":\"Entry cost and distance\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-1-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Free means zero entry tokens, while nearby means a short walk in this story. Both concern the same park and are separately supplied; neither is inferred from the other or from the neighboring-house raster. No general claim about actual park prices is made.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0041": {
    "senseId": "CD-0041",
    "content_version": 1,
    "term": "in contrast",
    "meaning": "Introduces a clear difference.",
    "example": "This room is bright. In contrast, that room is dark.",
    "kind": "facts",
    "title": "Two different rooms",
    "facts": [
      [
        "This room",
        "Room A is bright."
      ],
      [
        "That room",
        "Room B is dark."
      ],
      [
        "Referents",
        "A and B are distinct rooms, not the same room photographed at different times."
      ]
    ],
    "relationship": "In contrast compares the brightness of these two rooms. Their identity stays distinct.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0041.meaning-match.01",
      "CD-0041.example-match.01",
      "CD-0041.relationship-response.01",
      "CD-0041.compare-response.01",
      "CD-0041.transfer-response.01",
      "CD-0041.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"This room is bright. In contrast, that room is dark.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"This room\",\"Room A is bright.\"],[\"That room\",\"Room B is dark.\"],[\"Referents\",\"A and B are distinct rooms, not the same room photographed at different times.\"]],\"kind\":\"facts\",\"meaning\":\"Introduces a clear difference.\",\"question_ids\":[\"CD-0041.meaning-match.01\",\"CD-0041.example-match.01\",\"CD-0041.relationship-response.01\",\"CD-0041.compare-response.01\",\"CD-0041.transfer-response.01\",\"CD-0041.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"In contrast compares the brightness of these two rooms. Their identity stays distinct.\",\"senseId\":\"CD-0041\",\"term\":\"in contrast\",\"title\":\"Two different rooms\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-1-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "A andB explicitly name distinct rooms; bright and dark are stated local properties. This prevents a same-room-before/after reinterpretation. The diagram is illustrative rather than a lux measurement. Contrast compares properties without denying the first room’s brightness.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0045": {
    "senseId": "CD-0045",
    "content_version": 1,
    "term": "conversely",
    "meaning": "Introduces an opposite relationship or perspective.",
    "example": "More speed means less travel time. Conversely, less speed means more time.",
    "kind": "speed-time",
    "title": "Same route, different steady speeds",
    "facts": [
      [
        "Route",
        "Both trips follow the same 2 km route from A to B."
      ],
      [
        "Conditions",
        "Speeds are steady and there are no stops in this model. The diagram is not a prediction of real travel."
      ]
    ],
    "relationship": "For this fixed distance and these stated conditions, greater speed gives less travel time; lower speed gives more. Different routes or waiting time would require new facts.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0045.meaning-match.01",
      "CD-0045.example-match.01",
      "CD-0045.transfer.01",
      "CD-0045.relationship-response.01",
      "CD-0045.compare-response.01",
      "CD-0045.transfer-response.01",
      "CD-0045.repair-response.01"
    ],
    "trips": [
      {
        "distanceKm": 2,
        "speedKmh": 4,
        "minutes": 30
      },
      {
        "distanceKm": 2,
        "speedKmh": 2,
        "minutes": 60
      }
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"More speed means less travel time. Conversely, less speed means more time.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Route\",\"Both trips follow the same 2 km route from A to B.\"],[\"Conditions\",\"Speeds are steady and there are no stops in this model. The diagram is not a prediction of real travel.\"]],\"kind\":\"speed-time\",\"meaning\":\"Introduces an opposite relationship or perspective.\",\"question_ids\":[\"CD-0045.meaning-match.01\",\"CD-0045.example-match.01\",\"CD-0045.transfer.01\",\"CD-0045.relationship-response.01\",\"CD-0045.compare-response.01\",\"CD-0045.transfer-response.01\",\"CD-0045.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"For this fixed distance and these stated conditions, greater speed gives less travel time; lower speed gives more. Different routes or waiting time would require new facts.\",\"senseId\":\"CD-0045\",\"term\":\"conversely\",\"title\":\"Same route, different steady speeds\",\"trips\":[{\"distanceKm\":2,\"minutes\":30,\"speedKmh\":4},{\"distanceKm\":2,\"minutes\":60,\"speedKmh\":2}]}",
      "reviews": [
        {
          "reviewer": "AI-batch-1-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Both trips use exactly2km, positive steady speeds and no stops.2/4 hours equals30minutes and2/2 hours equals60minutes. The controlled table supports the reversed speed/time relation; it does not infer real cyclist speeds from pose. The separate10km comparison requires its own steady/average-speed assumptions; the2km panel must not silently supply its values.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0049": {
    "senseId": "CD-0049",
    "content_version": 1,
    "term": "since",
    "meaning": "Here introduces a reason; another sense marks a starting time.",
    "example": "Since it is raining, we will stay inside.",
    "kind": "facts",
    "title": "Reason for a future decision",
    "facts": [
      [
        "Reason now",
        "It is raining."
      ],
      [
        "Decision",
        "We will stay inside."
      ],
      [
        "Time",
        "This is a future decision, not a claim that an indoor game has already happened."
      ]
    ],
    "relationship": "Since introduces the rain as the reason for the decision. It is not a starting-time expression here.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0049.meaning-match.01",
      "CD-0049.example-match.01",
      "CD-0049.relationship-response.01",
      "CD-0049.compare-response.01",
      "CD-0049.transfer-response.01",
      "CD-0049.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"Since it is raining, we will stay inside.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Reason now\",\"It is raining.\"],[\"Decision\",\"We will stay inside.\"],[\"Time\",\"This is a future decision, not a claim that an indoor game has already happened.\"]],\"kind\":\"facts\",\"meaning\":\"Here introduces a reason; another sense marks a starting time.\",\"question_ids\":[\"CD-0049.meaning-match.01\",\"CD-0049.example-match.01\",\"CD-0049.relationship-response.01\",\"CD-0049.compare-response.01\",\"CD-0049.transfer-response.01\",\"CD-0049.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Since introduces the rain as the reason for the decision. It is not a starting-time expression here.\",\"senseId\":\"CD-0049\",\"term\":\"since\",\"title\":\"Reason for a future decision\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-2-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "The context keeps current rain separate from a future decision to stay indoors; it does not claim indoor play has already occurred. Since identifies a reason here, with temporal since treated in the independently described comparison. No visible indoor activity is treated as proof of a future outcome.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0059": {
    "senseId": "CD-0059",
    "content_version": 1,
    "term": "therefore",
    "meaning": "Introduces a conclusion or consequence.",
    "example": "All tickets are sold. Therefore, we cannot buy one.",
    "kind": "facts",
    "title": "Ticket availability",
    "facts": [
      [
        "Status",
        "All tickets in the current allocation for this event have been sold."
      ],
      [
        "Remaining",
        "Tickets available to us through the permitted purchasing channels at this time:0. No resale or later release is available in this story."
      ],
      [
        "Conclusion",
        "We cannot buy a ticket for this event through those channels at this time. An empty or unstaffed window alone would not establish sold out."
      ]
    ],
    "relationship": "Therefore links the stated unavailability in this current allocation to the local conclusion that we cannot buy a ticket now.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0059.meaning-match.01",
      "CD-0059.example-match.01",
      "CD-0059.relationship-response.01",
      "CD-0059.compare-response.01",
      "CD-0059.transfer-response.01",
      "CD-0059.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"All tickets are sold. Therefore, we cannot buy one.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Status\",\"All tickets in the current allocation for this event have been sold.\"],[\"Remaining\",\"Tickets available to us through the permitted purchasing channels at this time:0. No resale or later release is available in this story.\"],[\"Conclusion\",\"We cannot buy a ticket for this event through those channels at this time. An empty or unstaffed window alone would not establish sold out.\"]],\"kind\":\"facts\",\"meaning\":\"Introduces a conclusion or consequence.\",\"question_ids\":[\"CD-0059.meaning-match.01\",\"CD-0059.example-match.01\",\"CD-0059.relationship-response.01\",\"CD-0059.compare-response.01\",\"CD-0059.transfer-response.01\",\"CD-0059.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Therefore links the stated unavailability in this current allocation to the local conclusion that we cannot buy a ticket now.\",\"senseId\":\"CD-0059\",\"term\":\"therefore\",\"title\":\"Ticket availability\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-2-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "The source’s event and zero remaining tickets are explicitly identified, but all originally sold alone does not exclude resale or later releases. State which current allocation or purchasing channel is unavailable so the conclusion is local rather than an unconditional prohibition on buying any ticket.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0092": {
    "senseId": "CD-0092",
    "content_version": 1,
    "term": "while",
    "meaning": "Here means during the time that.",
    "example": "I sang while she played.",
    "kind": "timeline",
    "title": "Overlapping activities",
    "facts": [
      [
        "Speaker",
        "During the stated past interval, I was singing, not just speaking."
      ],
      [
        "Other person",
        "In this story she was playing the piano during that interval; piano is a supplied example of played."
      ],
      [
        "Time",
        "The singing and playing overlapped in time in this example."
      ]
    ],
    "relationship": "While locates the singing during her playing. It does not express a contrast in this sense.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0092.meaning-match.01",
      "CD-0092.example-match.01",
      "CD-0092.relationship-response.01",
      "CD-0092.compare-response.01",
      "CD-0092.transfer-response.01",
      "CD-0092.repair-response.01"
    ],
    "rendered_timeline_text": "Shared past time interval: singing and piano playing were both happening. The voice is explicitly described as singing.",
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"I sang while she played.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Speaker\",\"During the stated past interval, I was singing, not just speaking.\"],[\"Other person\",\"In this story she was playing the piano during that interval; piano is a supplied example of played.\"],[\"Time\",\"The singing and playing overlapped in time in this example.\"]],\"kind\":\"timeline\",\"meaning\":\"Here means during the time that.\",\"question_ids\":[\"CD-0092.meaning-match.01\",\"CD-0092.example-match.01\",\"CD-0092.relationship-response.01\",\"CD-0092.compare-response.01\",\"CD-0092.transfer-response.01\",\"CD-0092.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"While locates the singing during her playing. It does not express a contrast in this sense.\",\"rendered_timeline_text\":\"Shared past time interval: singing and piano playing were both happening. The voice is explicitly described as singing.\",\"senseId\":\"CD-0092\",\"term\":\"while\",\"title\":\"Overlapping activities\"}",
      "reviews": [
        {
          "reviewer": "root-ai-adjudication",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "The intended shared interval is explicitly supplied, so this sense of while is temporal rather than an inferred contrast. Source is a past report (sang/played), whereas facts assert I am singing and she is playing now. Use was/were for a faithful source model; add piano as a declared story detail rather than treating the word played as uniquely piano.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0111": {
    "senseId": "CD-0111",
    "content_version": 1,
    "term": "subsequently",
    "meaning": "Means at a later time, formally.",
    "example": "The team trained and subsequently improved.",
    "kind": "results",
    "title": "Training and a later result",
    "facts": [
      [
        "Earlier",
        "The team practised a passing drill."
      ],
      [
        "Same drill",
        "The same team attempts 10 passes under the same drill conditions."
      ],
      [
        "Later",
        "In this illustrative sequence, successful passes rise from 3 to 7. This is fictional scene data, not a learner performance record."
      ]
    ],
    "relationship": "Subsequently means the improved result occurred later than training. The connector alone does not prove training caused the improvement.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0111.meaning-match.01",
      "CD-0111.example-match.01",
      "CD-0111.relationship-response.01",
      "CD-0111.compare-response.01",
      "CD-0111.transfer-response.01",
      "CD-0111.repair-response.01"
    ],
    "results": [
      {
        "team": "Same team",
        "before": 3,
        "after": 7,
        "attempts": 10
      }
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"The team trained and subsequently improved.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Earlier\",\"The team practised a passing drill.\"],[\"Same drill\",\"The same team attempts 10 passes under the same drill conditions.\"],[\"Later\",\"In this illustrative sequence, successful passes rise from 3 to 7. This is fictional scene data, not a learner performance record.\"]],\"kind\":\"results\",\"meaning\":\"Means at a later time, formally.\",\"question_ids\":[\"CD-0111.meaning-match.01\",\"CD-0111.example-match.01\",\"CD-0111.relationship-response.01\",\"CD-0111.compare-response.01\",\"CD-0111.transfer-response.01\",\"CD-0111.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Subsequently means the improved result occurred later than training. The connector alone does not prove training caused the improvement.\",\"results\":[{\"after\":7,\"attempts\":10,\"before\":3,\"team\":\"Same team\"}],\"senseId\":\"CD-0111\",\"term\":\"subsequently\",\"title\":\"Training and a later result\"}",
      "reviews": [
        {
          "reviewer": "root-ai-adjudication",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Successful passes change3→7 out of10 attempts under the same drill conditions. This establishes the stated improvement in a fictional comparable task, not learner data. Subsequently orders improvement after training without proving causation. Before/after are relative to the declared practice sequence; the separate class-performance comparison has different facts.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0128": {
    "senseId": "CD-0128",
    "content_version": 1,
    "term": "in other words",
    "meaning": "Restates an idea differently.",
    "example": "It is optional. In other words, you do not have to do it.",
    "kind": "facts",
    "title": "Optional means not required",
    "facts": [
      [
        "It",
        "It refers to an extra drawing activity in this story."
      ],
      [
        "Take part",
        "You may choose to do the extra activity."
      ],
      [
        "Skip it",
        "You may choose not to do it. Skipping it breaks no requirement."
      ]
    ],
    "relationship": "In other words restates the same lack of obligation. Both choices are allowed; a picture of two activities alone does not establish optionality.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0128.meaning-match.01",
      "CD-0128.example-match.01",
      "CD-0128.relationship-response.01",
      "CD-0128.compare-response.01",
      "CD-0128.transfer-response.01",
      "CD-0128.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"It is optional. In other words, you do not have to do it.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"It\",\"It refers to an extra drawing activity in this story.\"],[\"Take part\",\"You may choose to do the extra activity.\"],[\"Skip it\",\"You may choose not to do it. Skipping it breaks no requirement.\"]],\"kind\":\"facts\",\"meaning\":\"Restates an idea differently.\",\"question_ids\":[\"CD-0128.meaning-match.01\",\"CD-0128.example-match.01\",\"CD-0128.relationship-response.01\",\"CD-0128.compare-response.01\",\"CD-0128.transfer-response.01\",\"CD-0128.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"In other words restates the same lack of obligation. Both choices are allowed; a picture of two activities alone does not establish optionality.\",\"senseId\":\"CD-0128\",\"term\":\"in other words\",\"title\":\"Optional means not required\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-4-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "It explicitly names an extra drawing activity. Both participation and skipping are allowed and skipping violates no requirement, so absence of obligation is established as a story permission rather than inferred from two activities in a raster. Optional does not mean prohibited.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0131": {
    "senseId": "CD-0131",
    "content_version": 2,
    "term": "to put it another way",
    "meaning": "Introduces a different wording of the same idea.",
    "example": "This strip is twice as long as that strip. To put it another way, two copies of that strip, placed end to end, would match this strip.",
    "kind": "strip-ratio",
    "title": "Two strips, one equivalent length claim",
    "facts": [
      [
        "This strip",
        "The longer strip is 2 equal units long."
      ],
      [
        "That strip",
        "The shorter strip is 1 of those same units long."
      ],
      [
        "Reference",
        "This and that name two different strips. Neither strip grows or changes length."
      ]
    ],
    "relationship": "Two copies of that strip placed end to end exactly match this strip. To put it another way restates this same relationship; it does not claim doubling over time.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "native_diagram_only",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0131.meaning-match.01",
      "CD-0131.example-match.01",
      "CD-0131.sentence-use.01",
      "CD-0131.relationship-response.01",
      "CD-0131.compare-response.01",
      "CD-0131.transfer-response.01",
      "CD-0131.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":2,\"example\":\"This strip is twice as long as that strip. To put it another way, two copies of that strip, placed end to end, would match this strip.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"This strip\",\"The longer strip is 2 equal units long.\"],[\"That strip\",\"The shorter strip is 1 of those same units long.\"],[\"Reference\",\"This and that name two different strips. Neither strip grows or changes length.\"]],\"kind\":\"strip-ratio\",\"meaning\":\"Introduces a different wording of the same idea.\",\"question_ids\":[\"CD-0131.meaning-match.01\",\"CD-0131.example-match.01\",\"CD-0131.sentence-use.01\",\"CD-0131.relationship-response.01\",\"CD-0131.compare-response.01\",\"CD-0131.transfer-response.01\",\"CD-0131.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"native_diagram_only\",\"relationship\":\"Two copies of that strip placed end to end exactly match this strip. To put it another way restates this same relationship; it does not claim doubling over time.\",\"senseId\":\"CD-0131\",\"term\":\"to put it another way\",\"title\":\"Two strips, one equivalent length claim\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-4-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Locked owner example remains verbatim with version2 and two distinct simultaneous strip referents. Candidate SVG uses400/200-unit widths; two200-unit copies meet atx300 and end atx500, matching the400-unit strip. App geometry independently uses360/180 and180-unit copies atx24 and204, ending384. Separating shifts the second copy tox226 (22-unit gap) without changing its length. Rendered PNG confirms exact ratio. No strip growth and no separate-raster approval are claimed.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0140": {
    "senseId": "CD-0140",
    "content_version": 1,
    "term": "on balance",
    "meaning": "Gives a judgment after weighing competing factors.",
    "example": "On balance, the benefits outweigh the costs.",
    "kind": "facts",
    "title": "A judgment about benefits and costs",
    "facts": [
      [
        "Benefits considered",
        "Learning a skill and enjoying time together."
      ],
      [
        "Costs considered",
        "Time and supplies for the activity."
      ],
      [
        "Judgment",
        "The speaker decides the benefits outweigh the costs in this story. Another person could weigh the tradeoff differently."
      ]
    ],
    "relationship": "On balance introduces the speaker’s judgment after considering competing factors. Outweigh is not a claim about physical mass, and this panel does not calculate a universal score.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0140.meaning-match.01",
      "CD-0140.example-match.01",
      "CD-0140.relationship-response.01",
      "CD-0140.compare-response.01",
      "CD-0140.transfer-response.01",
      "CD-0140.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"On balance, the benefits outweigh the costs.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Benefits considered\",\"Learning a skill and enjoying time together.\"],[\"Costs considered\",\"Time and supplies for the activity.\"],[\"Judgment\",\"The speaker decides the benefits outweigh the costs in this story. Another person could weigh the tradeoff differently.\"]],\"kind\":\"facts\",\"meaning\":\"Gives a judgment after weighing competing factors.\",\"question_ids\":[\"CD-0140.meaning-match.01\",\"CD-0140.example-match.01\",\"CD-0140.relationship-response.01\",\"CD-0140.compare-response.01\",\"CD-0140.transfer-response.01\",\"CD-0140.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"On balance introduces the speaker’s judgment after considering competing factors. Outweigh is not a claim about physical mass, and this panel does not calculate a universal score.\",\"senseId\":\"CD-0140\",\"term\":\"on balance\",\"title\":\"A judgment about benefits and costs\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-4-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Benefits, time/supply costs and the speaker’s favorable judgment are all supplied story facts. Outweigh is evaluative rather than physical mass; another speaker may weigh them differently. The text avoids a universal metric and makes no assertion of measured learner improvement.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0147": {
    "senseId": "CD-0147",
    "content_version": 1,
    "term": "likewise",
    "meaning": "Means similarly or in the same way.",
    "example": "The first team improved. Likewise, the second team improved.",
    "kind": "two-teams",
    "title": "The same kind of improvement for two teams",
    "facts": [
      [
        "Comparable drill",
        "Each team attempts 10 passes in the same drill before and after practice."
      ],
      [
        "First team",
        "Successful passes rise from 3 to 6."
      ],
      [
        "Second team",
        "Successful passes rise from 4 to 7. These are supplied fictional scene results, not learner measurements."
      ]
    ],
    "relationship": "Likewise connects the second team’s improvement to the first team’s similar improvement. The results need not be identical.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0147.meaning-match.01",
      "CD-0147.example-match.01",
      "CD-0147.relationship-response.01",
      "CD-0147.compare-response.01",
      "CD-0147.transfer-response.01",
      "CD-0147.repair-response.01"
    ],
    "results": [
      {
        "team": "First team",
        "before": 3,
        "after": 6,
        "attempts": 10
      },
      {
        "team": "Second team",
        "before": 4,
        "after": 7,
        "attempts": 10
      }
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"The first team improved. Likewise, the second team improved.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Comparable drill\",\"Each team attempts 10 passes in the same drill before and after practice.\"],[\"First team\",\"Successful passes rise from 3 to 6.\"],[\"Second team\",\"Successful passes rise from 4 to 7. These are supplied fictional scene results, not learner measurements.\"]],\"kind\":\"two-teams\",\"meaning\":\"Means similarly or in the same way.\",\"question_ids\":[\"CD-0147.meaning-match.01\",\"CD-0147.example-match.01\",\"CD-0147.relationship-response.01\",\"CD-0147.compare-response.01\",\"CD-0147.transfer-response.01\",\"CD-0147.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Likewise connects the second team’s improvement to the first team’s similar improvement. The results need not be identical.\",\"results\":[{\"after\":6,\"attempts\":10,\"before\":3,\"team\":\"First team\"},{\"after\":7,\"attempts\":10,\"before\":4,\"team\":\"Second team\"}],\"senseId\":\"CD-0147\",\"term\":\"likewise\",\"title\":\"The same kind of improvement for two teams\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-4-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Both teams improve under the same10-pass drill:3→6 and4→7. Both positive changes support likewise even though starting/final results differ. The scores are fictional scene results and do not measure a learner; smiles in a raster are unnecessary evidence. The separate class-finish comparison cannot inherit these pass scores.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0151": {
    "senseId": "CD-0151",
    "content_version": 1,
    "term": "as ... as",
    "meaning": "Shows equality in the measured quality.",
    "example": "This rope is as long as that one.",
    "kind": "equal-length",
    "title": "Equal length with aligned endpoints",
    "facts": [
      [
        "This rope",
        "Shown straight from the shared horizontal start position to the shared horizontal end position."
      ],
      [
        "That one",
        "A second straight rope spans exactly the same distance between those positions."
      ],
      [
        "Condition",
        "Both are drawn on the same flat plane in the same units without perspective distortion. The endpoints establish equality; no separate measurement-marker lines are drawn."
      ]
    ],
    "relationship": "As long as states equality in length here. It does not introduce a condition for permission.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "native_diagram_only",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0151.meaning-match.01",
      "CD-0151.example-match.01",
      "CD-0151.relationship-response.01",
      "CD-0151.compare-response.01",
      "CD-0151.transfer-response.01",
      "CD-0151.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"This rope is as long as that one.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"This rope\",\"Shown straight from the shared horizontal start position to the shared horizontal end position.\"],[\"That one\",\"A second straight rope spans exactly the same distance between those positions.\"],[\"Condition\",\"Both are drawn on the same flat plane in the same units without perspective distortion. The endpoints establish equality; no separate measurement-marker lines are drawn.\"]],\"kind\":\"equal-length\",\"meaning\":\"Shows equality in the measured quality.\",\"question_ids\":[\"CD-0151.meaning-match.01\",\"CD-0151.example-match.01\",\"CD-0151.relationship-response.01\",\"CD-0151.compare-response.01\",\"CD-0151.transfer-response.01\",\"CD-0151.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"native_diagram_only\",\"relationship\":\"As long as states equality in length here. It does not introduce a condition for permission.\",\"senseId\":\"CD-0151\",\"term\":\"as ... as\",\"title\":\"Equal length with aligned endpoints\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-4-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "App rectangles both runx24→384 withwidth360; candidate SVG ropes both runx100→500 withidentical16-unit strokes. Rendered PNG confirms aligned starts/ends and equal length on a flat plane. This is equality as+long+as, distinct from the conditional as long as. Facts refer to shared start/end markers, but neither inspected vector actually draws marker lines; call them coordinate positions/endpoints instead.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0166": {
    "senseId": "CD-0166",
    "content_version": 1,
    "term": "mind you",
    "meaning": "Adds a qualification to what was just said.",
    "example": "It is small. Mind you, it is comfortable.",
    "kind": "facts",
    "title": "One referent, two judgments",
    "facts": [
      [
        "It",
        "It refers to the sofa in this story."
      ],
      [
        "Size",
        "The speaker calls this sofa small relative to other sofas they considered."
      ],
      [
        "Comfort",
        "The speaker nevertheless finds this same sofa comfortable. Comfort is their stated judgment, not an image measurement."
      ]
    ],
    "relationship": "Mind you adds the comfortable qualification to the small-size statement. The referent stays the same.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0166.meaning-match.01",
      "CD-0166.example-match.01",
      "CD-0166.relationship-response.01",
      "CD-0166.compare-response.01",
      "CD-0166.transfer-response.01",
      "CD-0166.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"It is small. Mind you, it is comfortable.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"It\",\"It refers to the sofa in this story.\"],[\"Size\",\"The speaker calls this sofa small relative to other sofas they considered.\"],[\"Comfort\",\"The speaker nevertheless finds this same sofa comfortable. Comfort is their stated judgment, not an image measurement.\"]],\"kind\":\"facts\",\"meaning\":\"Adds a qualification to what was just said.\",\"question_ids\":[\"CD-0166.meaning-match.01\",\"CD-0166.example-match.01\",\"CD-0166.relationship-response.01\",\"CD-0166.compare-response.01\",\"CD-0166.transfer-response.01\",\"CD-0166.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Mind you adds the comfortable qualification to the small-size statement. The referent stays the same.\",\"senseId\":\"CD-0166\",\"term\":\"mind you\",\"title\":\"One referent, two judgments\"}",
      "reviews": [
        {
          "reviewer": "root-ai-adjudication",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "It explicitly names one sofa and retains that referent across small and comfortable. Small is relative to considered sofas; comfort is the speaker’s stated judgment. Mind you qualifies the initial consideration, without implying smallness and comfort are contradictory or measurable from posture.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0209": {
    "senseId": "CD-0209",
    "content_version": 1,
    "term": "for",
    "meaning": "Here identifies a recipient or intended beneficiary.",
    "example": "This gift is for Ana.",
    "kind": "facts",
    "title": "Name the intended recipient",
    "facts": [
      [
        "Object",
        "This gift is the gift in the example."
      ],
      [
        "Recipient",
        "Ana is the intended recipient."
      ],
      [
        "Intention",
        "The gift is for Ana. It may still be with the giver; delivery is not required by this sentence."
      ]
    ],
    "relationship": "For identifies the recipient or intended beneficiary. Names and intention come from the stated context, not appearance or outstretched hands.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0209.meaning-match.01",
      "CD-0209.example-match.01",
      "CD-0209.relationship-response.01",
      "CD-0209.compare-response.01",
      "CD-0209.transfer-response.01",
      "CD-0209.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"This gift is for Ana.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Object\",\"This gift is the gift in the example.\"],[\"Recipient\",\"Ana is the intended recipient.\"],[\"Intention\",\"The gift is for Ana. It may still be with the giver; delivery is not required by this sentence.\"]],\"kind\":\"facts\",\"meaning\":\"Here identifies a recipient or intended beneficiary.\",\"question_ids\":[\"CD-0209.meaning-match.01\",\"CD-0209.example-match.01\",\"CD-0209.relationship-response.01\",\"CD-0209.compare-response.01\",\"CD-0209.transfer-response.01\",\"CD-0209.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"For identifies the recipient or intended beneficiary. Names and intention come from the stated context, not appearance or outstretched hands.\",\"senseId\":\"CD-0209\",\"term\":\"for\",\"title\":\"Name the intended recipient\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-6-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Ana is the intended recipient by supplied identity/intention facts. For can identify an intended recipient before delivery, so outstretched hands and actual possession are not required. The separate Rae/Kim comparison changes the recipient in its own story.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0226": {
    "senseId": "CD-0226",
    "content_version": 1,
    "term": "do so",
    "meaning": "Substitutes for an action phrase.",
    "example": "Please close the door. I will do so.",
    "kind": "facts",
    "title": "Substitute the requested action",
    "facts": [
      [
        "Request",
        "Please close the door. The action phrase is close the door."
      ],
      [
        "Reply",
        "I will do so."
      ],
      [
        "Understood reply",
        "I will close the door. This is a future commitment, not proof that the door is already closed."
      ]
    ],
    "relationship": "Do so stands for close the door. It replaces the action phrase; no completed action is claimed by will.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0226.meaning-match.01",
      "CD-0226.example-match.01",
      "CD-0226.transfer.01",
      "CD-0226.relationship-response.01",
      "CD-0226.compare-response.01",
      "CD-0226.transfer-response.01",
      "CD-0226.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"Please close the door. I will do so.\",\"fact_basis\":\"Explicit illustrative story context; not measurements, product tests or claims inferred from raster artwork.\",\"facts\":[[\"Request\",\"Please close the door. The action phrase is close the door.\"],[\"Reply\",\"I will do so.\"],[\"Understood reply\",\"I will close the door. This is a future commitment, not proof that the door is already closed.\"]],\"kind\":\"facts\",\"meaning\":\"Substitutes for an action phrase.\",\"question_ids\":[\"CD-0226.meaning-match.01\",\"CD-0226.example-match.01\",\"CD-0226.transfer.01\",\"CD-0226.relationship-response.01\",\"CD-0226.compare-response.01\",\"CD-0226.transfer-response.01\",\"CD-0226.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Do so stands for close the door. It replaces the action phrase; no completed action is claimed by will.\",\"senseId\":\"CD-0226\",\"term\":\"do so\",\"title\":\"Substitute the requested action\"}",
      "reviews": [
        {
          "reviewer": "root-ai-adjudication",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Do so substitutes for close the door in a reply containing will. The model correctly preserves a future commitment and does not treat a closed-door raster as proof that the commitment was fulfilled. Locking/painting in the changed comparison remains a separately supplied action pair.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0060": {
    "senseId": "CD-0060",
    "content_version": 1,
    "term": "thus",
    "meaning": "Introduces a result or conclusion, formally.",
    "example": "The switch is off. Thus, the lamp has no power.",
    "kind": "facts",
    "title": "The stated switch-and-lamp setup",
    "facts": [
      [
        "Setup",
        "In this fictional setup, this switch controls the only power supply to this lamp; the lamp has no independent battery or second supply."
      ],
      [
        "State",
        "The switch is off."
      ],
      [
        "Result",
        "The lamp has no power in this stated setup. An unlit bulb alone would not establish the switch state."
      ]
    ],
    "relationship": "Thus presents the result in this particular setup; the picture is not an electrical test.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not a test or claim inferred from raster.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0060.meaning-match.01",
      "CD-0060.example-match.01",
      "CD-0060.relationship-response.01",
      "CD-0060.compare-response.01",
      "CD-0060.transfer-response.01",
      "CD-0060.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"The switch is off. Thus, the lamp has no power.\",\"fact_basis\":\"Explicit illustrative story context; not a test or claim inferred from raster.\",\"facts\":[[\"Setup\",\"In this fictional setup, this switch controls the only power supply to this lamp; the lamp has no independent battery or second supply.\"],[\"State\",\"The switch is off.\"],[\"Result\",\"The lamp has no power in this stated setup. An unlit bulb alone would not establish the switch state.\"]],\"kind\":\"facts\",\"meaning\":\"Introduces a result or conclusion, formally.\",\"question_ids\":[\"CD-0060.meaning-match.01\",\"CD-0060.example-match.01\",\"CD-0060.relationship-response.01\",\"CD-0060.compare-response.01\",\"CD-0060.transfer-response.01\",\"CD-0060.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"Thus presents the result in this particular setup; the picture is not an electrical test.\",\"senseId\":\"CD-0060\",\"term\":\"thus\",\"title\":\"The stated switch-and-lamp setup\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-2-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "The story states off switch and unpowered lamp, but saying this switch controls power does not rule out a second supply or battery. Make it the only power supply in this fictional setup. Then the thus inference follows locally; the separate disconnected-circuit comparison may validly use another source and is not contradictory by itself.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0071": {
    "senseId": "CD-0071",
    "content_version": 1,
    "term": "in order that",
    "meaning": "Formal purpose clause marker.",
    "example": "We wrote clearly in order that everyone could understand.",
    "kind": "facts",
    "title": "Clear writing for a purpose",
    "facts": [
      [
        "Writing",
        "A sample readable instruction for this story: Meet at the gate."
      ],
      [
        "Purpose",
        "We wrote clearly so that everyone could understand."
      ],
      [
        "Limit",
        "The purpose does not prove that every reader actually understood."
      ]
    ],
    "relationship": "In order that introduces the intended purpose of clear writing, not a guaranteed outcome.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not a test or claim inferred from raster.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0071.meaning-match.01",
      "CD-0071.example-match.01",
      "CD-0071.relationship-response.01",
      "CD-0071.compare-response.01",
      "CD-0071.transfer-response.01",
      "CD-0071.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"We wrote clearly in order that everyone could understand.\",\"fact_basis\":\"Explicit illustrative story context; not a test or claim inferred from raster.\",\"facts\":[[\"Writing\",\"A sample readable instruction for this story: Meet at the gate.\"],[\"Purpose\",\"We wrote clearly so that everyone could understand.\"],[\"Limit\",\"The purpose does not prove that every reader actually understood.\"]],\"kind\":\"facts\",\"meaning\":\"Formal purpose clause marker.\",\"question_ids\":[\"CD-0071.meaning-match.01\",\"CD-0071.example-match.01\",\"CD-0071.relationship-response.01\",\"CD-0071.compare-response.01\",\"CD-0071.transfer-response.01\",\"CD-0071.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"In order that introduces the intended purpose of clear writing, not a guaranteed outcome.\",\"senseId\":\"CD-0071\",\"term\":\"in order that\",\"title\":\"Clear writing for a purpose\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-2-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Clearly written words and the intended everyone-understands purpose are supplied; understanding is not observed or guaranteed. In order that introduces purpose with a finite clause. The sample Meet at the gate is explicitly a story instruction rather than a literacy test or measured efficacy claim.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0080": {
    "senseId": "CD-0080",
    "content_version": 1,
    "term": "as long as",
    "meaning": "Here means on condition that; another sense concerns duration.",
    "example": "You can play as long as you follow the rules.",
    "kind": "facts",
    "title": "Permission with a stated condition",
    "facts": [
      [
        "Permission",
        "You can play under this stated permission."
      ],
      [
        "Condition",
        "You follow the rules of this game."
      ],
      [
        "Rule example",
        "In this story, take turns and move one piece on your turn. If this condition is not met, this permission does not apply."
      ]
    ],
    "relationship": "As long as introduces the condition for this permission; it does not describe how many minutes play lasts.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Explicit illustrative story context; not a test or claim inferred from raster.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0080.meaning-match.01",
      "CD-0080.example-match.01",
      "CD-0080.relationship-response.01",
      "CD-0080.compare-response.01",
      "CD-0080.transfer-response.01",
      "CD-0080.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"You can play as long as you follow the rules.\",\"fact_basis\":\"Explicit illustrative story context; not a test or claim inferred from raster.\",\"facts\":[[\"Permission\",\"You can play under this stated permission.\"],[\"Condition\",\"You follow the rules of this game.\"],[\"Rule example\",\"In this story, take turns and move one piece on your turn. If this condition is not met, this permission does not apply.\"]],\"kind\":\"facts\",\"meaning\":\"Here means on condition that; another sense concerns duration.\",\"question_ids\":[\"CD-0080.meaning-match.01\",\"CD-0080.example-match.01\",\"CD-0080.relationship-response.01\",\"CD-0080.compare-response.01\",\"CD-0080.transfer-response.01\",\"CD-0080.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"As long as introduces the condition for this permission; it does not describe how many minutes play lasts.\",\"senseId\":\"CD-0080\",\"term\":\"as long as\",\"title\":\"Permission with a stated condition\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-2-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Permission is conditioned on the named game rules, with turn-taking and one-piece movement as local examples. If the condition fails this particular permission ceases to apply; that does not claim every possible permission is unavailable. The panel distinguishes conditional as long as from elapsed duration and supplies no claim about minutes of play.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0030": {
    "senseId": "CD-0030",
    "content_version": 2,
    "term": "however",
    "meaning": "Signals contrast with an earlier statement.",
    "example": "The rain seemed likely to stop our game. However, we played indoors.",
    "kind": "facts",
    "title": "Expectation and actual outcome",
    "facts": [
      [
        "Expectation",
        "The rain seemed likely to stop our game."
      ],
      [
        "Actual outcome",
        "We played indoors."
      ]
    ],
    "relationship": "However marks the contrast between the expected stopped game and actual indoor play.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Editable source context or deterministic side-view diagram; never approval of raster geometry.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0030.meaning-match.01",
      "CD-0030.example-match.01",
      "CD-0030.sentence-use.01",
      "CD-0030.relationship-response.01",
      "CD-0030.compare-response.01",
      "CD-0030.transfer-response.01",
      "CD-0030.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":2,\"example\":\"The rain seemed likely to stop our game. However, we played indoors.\",\"fact_basis\":\"Editable source context or deterministic side-view diagram; never approval of raster geometry.\",\"facts\":[[\"Expectation\",\"The rain seemed likely to stop our game.\"],[\"Actual outcome\",\"We played indoors.\"]],\"kind\":\"facts\",\"meaning\":\"Signals contrast with an earlier statement.\",\"question_ids\":[\"CD-0030.meaning-match.01\",\"CD-0030.example-match.01\",\"CD-0030.sentence-use.01\",\"CD-0030.relationship-response.01\",\"CD-0030.compare-response.01\",\"CD-0030.transfer-response.01\",\"CD-0030.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"However marks the contrast between the expected stopped game and actual indoor play.\",\"senseId\":\"CD-0030\",\"term\":\"however\",\"title\":\"Expectation and actual outcome\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-1-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Version2 owner-approved rain/game wording is bound exactly. Expected cancellation and actual indoor play are separate supplied facts, so however marks contrast with the expectation. This does not rule out a grammatical causal connector when a different relation is requested; the changed comparison describes its own causal move.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0160": {
    "senseId": "CD-0160",
    "content_version": 2,
    "term": "you see",
    "meaning": "Introduces an explanation.",
    "example": "We cannot leave yet. You see, the door is locked.",
    "kind": "facts",
    "title": "A stated reason",
    "facts": [
      [
        "Situation",
        "We cannot leave yet."
      ],
      [
        "Explanation",
        "The door is locked."
      ]
    ],
    "relationship": "You see introduces the explanation in the second sentence, rather than a literal command to look.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "show_reviewed_supporting_scene",
    "fact_basis": "Editable source context or deterministic side-view diagram; never approval of raster geometry.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0160.meaning-match.01",
      "CD-0160.example-match.01",
      "CD-0160.sentence-use.01",
      "CD-0160.relationship-response.01",
      "CD-0160.compare-response.01",
      "CD-0160.transfer-response.01",
      "CD-0160.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":2,\"example\":\"We cannot leave yet. You see, the door is locked.\",\"fact_basis\":\"Editable source context or deterministic side-view diagram; never approval of raster geometry.\",\"facts\":[[\"Situation\",\"We cannot leave yet.\"],[\"Explanation\",\"The door is locked.\"]],\"kind\":\"facts\",\"meaning\":\"Introduces an explanation.\",\"question_ids\":[\"CD-0160.meaning-match.01\",\"CD-0160.example-match.01\",\"CD-0160.sentence-use.01\",\"CD-0160.relationship-response.01\",\"CD-0160.compare-response.01\",\"CD-0160.transfer-response.01\",\"CD-0160.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"show_reviewed_supporting_scene\",\"relationship\":\"You see introduces the explanation in the second sentence, rather than a literal command to look.\",\"senseId\":\"CD-0160\",\"term\":\"you see\",\"title\":\"A stated reason\"}",
      "reviews": [
        {
          "reviewer": "root-ai-adjudication",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Version2 keeps two full written sentences. Cannot leave yet and locked door are explicitly related as situation and explanation. You see is discourse explanation rather than a literal looking instruction. This is a local story; a locked door need not imply every possible exit is unavailable in all situations.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  },
  "CD-0182": {
    "senseId": "CD-0182",
    "content_version": 1,
    "term": "underneath",
    "meaning": "Directly under something.",
    "example": "The key is underneath the mat.",
    "kind": "underneath",
    "title": "Directly underneath in a side view",
    "facts": [
      [
        "View",
        "This is a cutaway side view, with the mat above and the key directly below it."
      ],
      [
        "Alignment",
        "The key stays inside the horizontal span of the mat."
      ],
      [
        "Limit",
        "This app diagram does not verify the placement in a separate raster illustration."
      ]
    ],
    "relationship": "Underneath places the key directly under the mat, not beside the mat or merely in its shadow.",
    "review_status": "reviewed",
    "publication_status": "published",
    "human_approved": false,
    "educator_approval": false,
    "raster_policy": "native_diagram_only",
    "fact_basis": "Editable source context or deterministic side-view diagram; never approval of raster geometry.",
    "question_mapping": "This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.",
    "question_ids": [
      "CD-0182.meaning-match.01",
      "CD-0182.example-match.01",
      "CD-0182.relationship-response.01",
      "CD-0182.compare-response.01",
      "CD-0182.transfer-response.01",
      "CD-0182.repair-response.01"
    ],
    "reviewer": "AI primary and independent editorial review",
    "reviewed_at": "2026-10-12T07:10:41Z",
    "reviewer_type": "ai",
    "review_policy": "ai-independent-v1",
    "human_review_required": false,
    "review_evidence": {
      "snapshot": "{\"content_version\":1,\"example\":\"The key is underneath the mat.\",\"fact_basis\":\"Editable source context or deterministic side-view diagram; never approval of raster geometry.\",\"facts\":[[\"View\",\"This is a cutaway side view, with the mat above and the key directly below it.\"],[\"Alignment\",\"The key stays inside the horizontal span of the mat.\"],[\"Limit\",\"This app diagram does not verify the placement in a separate raster illustration.\"]],\"kind\":\"underneath\",\"meaning\":\"Directly under something.\",\"question_ids\":[\"CD-0182.meaning-match.01\",\"CD-0182.example-match.01\",\"CD-0182.relationship-response.01\",\"CD-0182.compare-response.01\",\"CD-0182.transfer-response.01\",\"CD-0182.repair-response.01\"],\"question_mapping\":\"This panel models this sense’s source example. Changed situations and answer alternatives are separately described scenes.\",\"raster_policy\":\"native_diagram_only\",\"relationship\":\"Underneath places the key directly under the mat, not beside the mat or merely in its shadow.\",\"senseId\":\"CD-0182\",\"term\":\"underneath\",\"title\":\"Directly underneath in a side view\"}",
      "reviews": [
        {
          "reviewer": "AI-batch-6-final",
          "verdict": "pass",
          "rationale": "Root checked exact declared facts and deterministic geometry; independently reviewed refinements were applied. Any prescribed correction was applied as the reviewed final variant.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        },
        {
          "reviewer": "AI-independent-context-review",
          "verdict": "pass",
          "rationale": "Candidate SVG mat occupiesx90–330,y45–63; key extendsapproximatelyx178–242 including strokes,y113–133. App mat matches that box; key circle and stem remain inside the mat’s horizontal span and below it. Rendered PNG visibly confirms directly-below alignment in the declared cutaway side view. The gap clarifies the relation, not actual floor thickness or depth. A separate ambiguous raster is explicitly not verified.",
          "reviewed_at": "2026-10-12T07:10:41Z"
        }
      ]
    }
  }
};

export function underneathGeometry(){return {mat:{x:90,y:45,width:240,height:18},key:{x:180,y:115,width:60,height:16}};}

export function contextForSense(sense){
 const context=sceneContexts[sense.id];return context&&(sense.publication_status!=='published'||aiReviewComplete(context,'context'))&&['content_version','term','meaning','example'].every(k=>context[k]===sense[k])?context:null;
}
export function stripGeometry(joined=true){
 return {long:{x:24,y:26,width:360,height:24},short:{x:24,y:87,width:180,height:24},copies:[{x:24,y:156,width:180,height:24},{x:joined?204:226,y:156,width:180,height:24}]};
}
export function equalLengthGeometry(){return [{x:24,y:30,width:360,height:24},{x:24,y:100,width:360,height:24}];}
export function sceneContextView(sense,el,button){
 const context=contextForSense(sense);if(!context)return null;
 const panel=el('section',undefined,'cl-context');panel.dataset.senseId=sense.id;panel.dataset.contentVersion=String(sense.content_version);panel.append(el('h3',context.title));
 const facts=el('dl');for(const [label,text]of context.facts)facts.append(el('dt',label),el('dd',text));panel.append(facts);
 const doc=panel.ownerDocument,svgNode=(tag,attrs={})=>{const n=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
 if(context.kind==='strip-ratio'||context.kind==='equal-length'){
  const ratio=context.kind==='strip-ratio',svg=svgNode('svg',{viewBox:ratio?'0 0 420 220':'0 0 420 165',role:'img','aria-label':ratio?'Three rows: this strip is twice the length of that strip; two copies of that strip can be placed end to end to match this strip.':'Two straight ropes have aligned starts, aligned ends and exactly equal drawn lengths.',class:'cl-geometry'}),draw=(g,label,fill)=>{const rect=svgNode('rect',{...g,fill,stroke:'#f6f7fb','stroke-width':2});rect.dataset.geometry=label;svg.append(rect);};
  if(ratio){let joined=true;const output=el('p',undefined,'feedback');output.setAttribute('role','status');output.setAttribute('aria-live','polite');const controls=el('div',undefined,'actions'),join=button('Place copies end to end',()=>{joined=true;update();}),separate=button('Separate the two copies',()=>{joined=false;update();});function update(){svg.replaceChildren();const g=stripGeometry(joined);draw(g.long,'this-strip','#9fe5ff');draw(g.short,'that-strip','#ffe29a');g.copies.forEach((rect,i)=>draw(rect,'copy-'+(i+1),'#ffe29a'));join.setAttribute('aria-pressed',String(joined));separate.setAttribute('aria-pressed',String(!joined));output.textContent=joined?'Two copies placed end to end match the longer strip exactly. Each copy has the same length as that shorter strip.':'The two copies are separated by a gap. Their lengths do not change; place them end to end to compare with the longer strip.';}controls.append(join,separate);panel.append(svg,el('p','Rows: this longer strip; that shorter strip; two copies of that shorter strip.'),controls,output);update();
  }else{equalLengthGeometry().forEach((g,i)=>draw(g,'rope-'+(i+1),i?'#ffe29a':'#9fe5ff'));panel.append(svg,el('p','Top: this rope. Bottom: that rope. Both start and end at the same positions.'));}
 }
 if(context.kind==='underneath'){
  const g=underneathGeometry(),svg=svgNode('svg',{viewBox:'0 0 420 170',role:'img','aria-label':'Cutaway side view: a mat is above a key, and the key lies directly within the horizontal span of the mat.',class:'cl-geometry'});
  svg.append(svgNode('rect',{...g.mat,fill:'#9fe5ff',stroke:'#f6f7fb','stroke-width':2}),svgNode('circle',{cx:g.key.x+8,cy:g.key.y+8,r:8,fill:'none',stroke:'#ffe29a','stroke-width':4}),svgNode('line',{x1:g.key.x+16,y1:g.key.y+8,x2:g.key.x+g.key.width,y2:g.key.y+8,stroke:'#ffe29a','stroke-width':5}),svgNode('line',{x1:g.key.x+48,y1:g.key.y+8,x2:g.key.x+48,y2:g.key.y+16,stroke:'#ffe29a','stroke-width':4}));panel.append(svg,el('p','Top shape: mat. Lower shape: key, directly under the mat. The gap makes the below relationship visible in this cutaway view.'));
 }
 if(context.kind==='speed-time'||context.results){
  const table=el('table'),caption=el('caption',context.kind==='speed-time'?'Same route, no stops':'Same drill before and after'),head=el('thead'),row=el('tr'),body=el('tbody');table.append(caption,head,body);head.append(row);for(const text of context.kind==='speed-time'?['Trip','Distance','Speed','Time']:['Team','Before','After','Attempts']){const th=el('th',text);th.scope='col';row.append(th);}
  const values=context.kind==='speed-time'?context.trips.map((t,i)=>['Trip '+(i+1),t.distanceKm+' km',t.speedKmh+' km/h',t.minutes+' min']):context.results.map(t=>[t.team,String(t.before),String(t.after),String(t.attempts)]);
  for(const valuesRow of values){const tr=el('tr');valuesRow.forEach((v,i)=>{const cell=el(i?'td':'th',v);if(!i)cell.scope='row';tr.append(cell);});body.append(tr);}panel.append(table);
 }
 if(context.kind==='timeline')panel.append(el('p','Shared past time interval: singing and piano playing were both happening. The voice is explicitly described as singing.'));
 const output=el('p',context.relationship,'feedback');output.setAttribute('role','status');output.setAttribute('aria-live','polite');panel.append(button('Show this relationship',()=>{output.textContent=context.relationship;}),output,el('p',context.question_mapping));return panel;
}

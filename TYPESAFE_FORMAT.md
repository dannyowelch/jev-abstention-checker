# TypeSafe API Format

## Example Request (what we send)

```json
{
  "state": "Revenue increased 23% year-over-year from $4.2M to $5.2M.",
  "model": "jev-latest",
  "questions": {
    "forced": {
      "type": "choice",
      "instructions": "Which label best fits the state?",
      "criteria": {
        "profitable": "profitable",
        "unprofitable": "unprofitable"
      }
    },
    "idk": {
      "type": "choice",
      "instructions": "Which label best fits the state, or is there insufficient evidence?",
      "criteria": {
        "profitable": "profitable",
        "unprofitable": "unprofitable",
        "idk": "Not enough evidence to choose"
      }
    },
    "noul": {
      "type": "noul",
      "instructions": "Does the state contain enough decision-relative evidence to choose between \"profitable\" and \"unprofitable\"?"
    }
  }
}
```

## Example Response (what we parse)

```json
{
  "answers": {
    "forced": {
      "choice": "profitable",
      "confidence": 0.87,
      "probabilities": {
        "profitable": 0.87,
        "unprofitable": 0.13
      }
    },
    "idk": {
      "choice": "profitable",
      "confidence": 0.82,
      "probabilities": {
        "profitable": 0.82,
        "unprofitable": 0.10,
        "idk": 0.08
      }
    },
    "noul": {
      "noul": "yes",
      "confidence": 0.91
    }
  }
}
```

## Split Noul Gate Logic

The "Split Noul Gate" in the UI:
1. Checks `answers.noul.noul === "yes"` AND `answers.noul.confidence > 0.7`
2. If true: show `answers.forced.choice` with its confidence
3. If false: show "abstain" with the noul confidence level

"use client";

import { useState } from "react";

const THIN_SAMPLE = `The document mentions revenue increased, but doesn't specify by how much or provide comparative data.`;

const RICH_SAMPLE = `Revenue increased 23% year-over-year from $4.2M to $5.2M. Customer acquisition cost decreased 15% while retention improved to 94%. Gross margins expanded from 62% to 68% due to operational efficiencies.`;

type GateResult = {
  choice?: string;
  confidence?: number;
  noulAnswer?: string;
  noulConfidence?: number;
  abstained?: boolean;
  error?: string;
};

export default function Home() {
  const [state, setState] = useState(THIN_SAMPLE);
  const [labelA, setLabelA] = useState("profitable");
  const [labelB, setLabelB] = useState("unprofitable");
  const [apiKey, setApiKey] = useState("");
  
  const [results, setResults] = useState<{
    forced?: GateResult;
    idk?: GateResult;
    noul?: GateResult;
  }>({});
  
  const [swappedResults, setSwappedResults] = useState<{
    forced?: GateResult;
    idk?: GateResult;
    noul?: GateResult;
  }>({});
  
  const [loading, setLoading] = useState(false);
  const [showSwapped, setShowSwapped] = useState(false);

  const runAllGates = async (swapLabels = false) => {
    setLoading(true);
    const resultsObj: any = {};

    try {
      const effectiveLabelA = swapLabels ? labelB : labelA;
      const effectiveLabelB = swapLabels ? labelA : labelB;

      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          state,
          labelA: effectiveLabelA,
          labelB: effectiveLabelB,
          runAll: true,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        resultsObj.forced = { error: data.error };
        resultsObj.idk = { error: data.error };
        resultsObj.noul = { error: data.error };
      } else {
        const answers = data.answers;

        if (answers?.forced) {
          resultsObj.forced = {
            choice: answers.forced.choice,
            confidence: answers.forced.confidence,
          };
        }

        if (answers?.idk) {
          const chosen = answers.idk.choice;
          resultsObj.idk = {
            choice: chosen,
            confidence: answers.idk.confidence,
            abstained: chosen === "idk",
          };
        }

        if (answers?.noul && answers?.forced) {
          const noulAnswer = answers.noul.noul;
          const noulConf = answers.noul.confidence;
          const hasEvidence = noulAnswer === "yes" && noulConf > 0.7;

          if (hasEvidence) {
            resultsObj.noul = {
              noulAnswer,
              noulConfidence: noulConf,
              choice: answers.forced.choice,
              confidence: answers.forced.confidence,
              abstained: false,
            };
          } else {
            resultsObj.noul = {
              noulAnswer,
              noulConfidence: noulConf,
              abstained: true,
            };
          }
        }
      }

      if (swapLabels) {
        setSwappedResults(resultsObj);
      } else {
        setResults(resultsObj);
      }
    } catch (error) {
      console.error("Error running gates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    setShowSwapped(false);
    setSwappedResults({});
    runAllGates(false);
  };

  const handleSwap = async () => {
    setShowSwapped(true);
    await runAllGates(true);
  };

  const renderGateCard = (
    title: string,
    description: string,
    result?: GateResult,
    swappedResult?: GateResult
  ) => {
    const renderResult = (res?: GateResult, label = "") => {
      if (!res) return <div className="text-gray-400 text-sm">Not run yet</div>;
      if (res.error) return <div className="text-red-600 text-sm">{res.error}</div>;
      
      return (
        <div className="space-y-1">
          {label && <div className="text-xs text-gray-500 font-medium">{label}</div>}
          {res.noulAnswer && (
            <div className="text-sm">
              <span className="font-medium">Evidence sufficient?</span>{" "}
              <span className={res.noulAnswer === "yes" ? "text-green-700" : "text-orange-700"}>
                {res.noulAnswer}
              </span>
              {res.noulConfidence && (
                <span className="text-gray-600 ml-1">
                  ({(res.noulConfidence * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          )}
          {res.abstained ? (
            <div className="text-orange-700 font-medium">abstain</div>
          ) : res.choice ? (
            <div>
              <div className="font-medium text-gray-900">{res.choice}</div>
              {res.confidence && (
                <div className="text-sm text-gray-600">
                  {(res.confidence * 100).toFixed(1)}% confidence
                </div>
              )}
            </div>
          ) : null}
        </div>
      );
    };

    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600 mb-3">{description}</p>
        
        <div className="space-y-3">
          {renderResult(result, showSwapped ? "Original:" : "")}
          {showSwapped && swappedResult && (
            <>
              <div className="border-t border-gray-200 pt-2" />
              {renderResult(swappedResult, "Swapped:")}
            </>
          )}
        </div>

        {showSwapped && result && swappedResult && !result.error && !swappedResult.error && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-700">
              {result.choice !== swappedResult.choice && !result.abstained && !swappedResult.abstained ? (
                <span className="text-orange-700 font-medium">⚠️ Choice flipped</span>
              ) : result.abstained !== swappedResult.abstained ? (
                <span className="text-orange-700 font-medium">⚠️ Abstention changed</span>
              ) : (
                <span className="text-green-700">✓ Consistent</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Jev Abstention Checker
        </h1>
        <p className="text-sm text-gray-600">
          Compare forced Choice vs Choice+IDK vs Noul sufficiency gate. Test label-order sensitivity.
        </p>
      </header>

      <div className="space-y-6">
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <textarea
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm font-mono"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setState(THIN_SAMPLE)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Load thin sample
                </button>
                <button
                  onClick={() => setState(RICH_SAMPLE)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Load rich sample
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label A
                </label>
                <input
                  type="text"
                  value={labelA}
                  onChange={(e) => setLabelA(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label B
                </label>
                <input
                  type="text"
                  value={labelB}
                  onChange={(e) => setLabelB(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TypeSafe API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ts_..."
                className="w-full p-2 border border-gray-300 rounded text-sm font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                disabled={loading || !apiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? "Running..." : "Check"}
              </button>
              <button
                onClick={handleSwap}
                disabled={loading || !apiKey || !results.forced}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Swap labels
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderGateCard(
            "Forced Choice",
            "Only the two labels, no abstain option",
            results.forced,
            swappedResults.forced
          )}
          {renderGateCard(
            "Choice + IDK",
            "Two labels plus explicit 'idk' option",
            results.idk,
            swappedResults.idk
          )}
          {renderGateCard(
            "Split Noul Gate",
            "First check evidence sufficiency, then choose or abstain",
            results.noul,
            swappedResults.noul
          )}
        </div>
      </div>
    </main>
  );
}

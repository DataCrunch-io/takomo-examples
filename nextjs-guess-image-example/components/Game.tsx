import { useEffect, useRef, useState } from "react";
import { generate } from "random-words";

const GENERATE_IMAGE_URL =
  "https://api.takomo.ai/19386010-531f-4e44-8b5f-9dabe14395f5/sync";
const BLIP_URL =
  "https://api.takomo.ai/c1a9223f-f71c-4f6e-a17d-c3f354bcf69c/sync";
const SECRET_TOKEN =
  "tk_d6316b21998ace1d6a216d00665c5449c2fbd4a533f8e9a4fa0fe2d238af4ad3c3cb6d7f2e1c0489f807c2d4ea0e2ce1";

const NUMBER_OF_IMAGES = 4;

const NUMBER_OF_WORDS = 1;
const MIN_WORD_LENGTH = 3;

function Game() {
  const [gameState, setGameState] = useState("start" as "start" | "end");
  const [images, setImages] = useState(Array(NUMBER_OF_IMAGES).fill(null));
  const [outputPrompts, setOutputPrompts] = useState(
    Array(NUMBER_OF_IMAGES).fill(null)
  );

  const ref = useRef(null);

  const [chosenWord, setChosenWord] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerIndex, setAnswerIndex] = useState(null);
  const [loadingBlipAnswer, setLoadingBlipAnswer] = useState(false);

  const isAllImagesLoaded = images.every((img) => img !== null);

  useEffect(() => {
    async function fetchImages(index, word) {
      const res = await fetch(GENERATE_IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SECRET_TOKEN}`,
        },
        body: JSON.stringify({
          input_text: word,
        }),
      });
      const data = await res.json();
      console.log(data);
      const imageUrl = data.data.output.downloadUrl ?? null;
      const outputPrompt = data.data.output_prompt ?? null;
      const blob = await fetch(imageUrl).then((r) => r.blob());
      setImages((prev) => {
        const newImages = [...prev];
        newImages[index] = blob;
        setOutputPrompts((prev) => {
          const newOutputPrompts = [...prev];
          newOutputPrompts[index] = outputPrompt;
          return newOutputPrompts;
        });
        return newImages;
      });
    }

    if (!ref.current) {
      const words = generate({
        exactly: NUMBER_OF_IMAGES,
        minLength: MIN_WORD_LENGTH,
      });

      for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
        fetchImages(i, words[i]);
      }
      // setAnswerIndex(Math.floor(Math.random() * NUMBER_OF_IMAGES));
      setAnswerIndex((prev) => {
        const newIndex = Math.floor(Math.random() * NUMBER_OF_IMAGES);
        setChosenWord(words[newIndex]);
        return newIndex === prev ? (newIndex + 1) % NUMBER_OF_IMAGES : newIndex;
      });
    }

    ref.current = true;
    return () => {
      // ref.current = false;
      console.log("unmounting");
    };
  }, []);

  async function askQuestion() {
    setLoadingBlipAnswer(true);
    const formData = new FormData();
    formData.append("input_text", question);
    formData.append("input_image", images[answerIndex]);

    const res = await fetch(BLIP_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET_TOKEN}`,
        ContentType: "multipart/form-data",
      },
      body: formData,
    });
    const data = await res.json();
    console.log(data);
    setAnswer(data.data.output);
    setLoadingBlipAnswer(false);
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Chosen word */}
      <div className="text-2xl font-bold text-center text-white">
        {chosenWord}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {images.map((blob, id) => (
          <div
            key={id}
            className="w-64 h-64 relative bg-gradient-to-br from-blue-800 to-black rounded-lg"
          >
            {blob !== null ? (
              <>
                <img
                  src={URL.createObjectURL(blob)}
                  className="object-cover w-full h-full rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out
                  hover:scale-105
                "
                />
                {console.log(outputPrompts[id])}
                {/* <p className="absolute top-1 left-1 w-full text-center text-xs font-bold text-white bg-black bg-opacity-50">
                  {outputPrompts[id]}
                </p> */}
              </>
            ) : (
              <div className="w-full h-full rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out bg-gray-300">
                <div
                  role="status"
                  className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
                >
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-blue-400 animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 w-full max-w-md">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded bg-gray-800 text-white placeholder-gray-500"
            disabled={loadingBlipAnswer || !isAllImagesLoaded}
            placeholder={loadingBlipAnswer ? "Loading..." : "Ask a question"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="p-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white ml-2 rounded disabled:opacity-50"
            onClick={askQuestion}
            disabled={loadingBlipAnswer || !isAllImagesLoaded}
          >
            Ask
          </button>
        </div>
        <div className="mt-2 text-center text-gray-400">{answer}</div>
      </div>
    </div>
  );
}

export default Game;

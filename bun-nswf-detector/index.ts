const { TAKOMO_TOKEN, TEXT_URL, IMAGE_URL } = Bun.env;


const server = Bun.serve({
  port: 3010,
  async fetch(req) {
    const reqPath = new URL(req.url).pathname;
    if (reqPath !== "/nsfw-detect") {
      return new Response(null, { status: 404 });
    }
    if (req.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    const formdata = await req.formData();
    const text = formdata.get("text");
    const image = formdata.get("image");

    console.log({text})

    if (!text && !image) {
      return new Response("Provide image or text", { status: 400 });
    } else {
      let nswf_flag = false;

      if (text) {
        const takomoRequest = await fetch(TEXT_URL as string, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TAKOMO_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: text,
          }),
        });

        const takomoResponse = await takomoRequest.json();
        console.log({takomoResponse})
        const { NSFW_detected } = JSON.parse(takomoResponse.data.output);

        if (NSFW_detected) {
          nswf_flag = true;
        }
      }

      if (image) {
        const formData = new FormData();
        formData.append("input", image as Blob);

        const takomoRequest = await fetch(IMAGE_URL as string, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TAKOMO_TOKEN}`,
            ContentType: "multipart/form-data",
          },
          body: formData,
        });

        const takomoResponse = await takomoRequest.json();
        const output = takomoResponse.data?.output || false;

        console.log(takomoResponse)

        if (output) {
          nswf_flag = true;
        }
      }

      return new Response(
        JSON.stringify({
          nswf_flag,
        }),
        { status: 200 }
      );
    }
  },
  error(e) {
    console.log(e)

    return new Response("error", { status: 500 });
  },
});

console.log(`
    Bun is running on port ${server.port}
`);

async function generateAd() {
  const prompt = document.getElementById("prompt").value;
  const tone = document.getElementById("tone").value;

  if (!prompt) {
    alert("Please enter a prompt");
    return;
  }

  const response = await fetch("http://localhost:5000/api/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt, tone })
  });

  const data = await response.json();

  document.getElementById("adImage").src = data.imageUrl;
  document.getElementById("caption").innerText = data.caption;
  document.getElementById("hashtags").innerText = data.hashtags;

  document.getElementById("result").classList.remove("hidden");
}

function getData() {
    return {
      teamA: document.getElementById("teamA").value,
      teamB: document.getElementById("teamB").value,
      score: document.getElementById("score").value,
      totalGoals: document.getElementById("totalGoals").value,
      mvp: document.getElementById("mvp").value,
      halftime: document.getElementById("halftime").value,
      firstScorer: document.getElementById("firstScorer").value,
      goalsHalftime: document.getElementById("goalsHalftime").value,
      scorers: document.getElementById("scorers").value,
      cards: document.getElementById("cards").value,
      starA: document.getElementById("starA").value,
      starB: document.getElementById("starB").value,
      referee: document.getElementById("referee").value,
      placeA: document.getElementById("placeA").value,
      placeB: document.getElementById("placeB").value,
      events: document.getElementById("events").value,
      matchLevel: document.getElementById("matchLevel").value
    };
  }
  
  function validate(data) {
    if (!data.teamA || !data.teamB || !data.score || !data.totalGoals || !data.mvp) {
      showToast("⚠️ Uzupełnij wymagane pola: drużyny, wynik, bramki i MVP!", "warning");
      return false;
    }
    return true;
  }
  
  async function generateSummary() {
    const data = getData();
    const mode = document.getElementById("mode").value;
    const style = document.getElementById("style").value;
    const apiKey = document.getElementById("apikey").value;
    const summaryDiv = document.getElementById("summary");
    const generateBtn = document.getElementById("generateBtn");
  
    if (style === "poziom" && data.matchLevel.trim() === "") {
      showToast("📋 Wypełnij pole 'Poziom meczu', aby użyć tego stylu.", "info");
      return;
    }
  
    if (!validate(data)) {
      generateBtn.disabled = false;
      generateBtn.classList.remove("loading");
      return;
    }
  
    generateBtn.disabled = true;
    generateBtn.classList.add("loading");
    summaryDiv.textContent = "";
  
    const finish = () => {
      generateBtn.disabled = false;
      generateBtn.classList.remove("loading");
    };
  
    let styleInstructions = "";
    if (style === "luz") {
      styleInstructions = "Napisz w lekkim, zabawnym stylu, pełnym luzu i emocji.";
    } else if (style === "poziom") {
      styleInstructions = "Skoncentruj się na analizie poziomu meczu.";
    } else if (style === "dziennikarz") {
      styleInstructions = "Napisz w stylu profesjonalnego dziennikarza sportowego.";
    } else if (style === "emocjonujacy") {
      styleInstructions = "Napisz emocjonujące podsumowanie pełne napięcia.";
    } else {
      styleInstructions = "Napisz w poważnym, sportowo-analitycznym stylu.";
    }
  
    if (mode === "template") {
      typeText(summaryDiv, generateTemplate(data, style), 0, finish);
    } else {
      if (!apiKey) {
        showToast("🔑 Wprowadź klucz API, aby użyć AI.", "warning");
        finish();
        return;
      }
  
      let prompt = `${styleInstructions}\nStwórz podsumowanie meczu piłkarskiego pomiędzy ${data.teamA} i ${data.teamB}.\nWynik końcowy: ${data.score}.`;
  
      if (data.halftime) prompt += ` (do przerwy: ${data.halftime}).`;
      if (data.firstScorer) prompt += `\nPierwszy strzelec: ${data.firstScorer}.`;
      if (data.totalGoals) prompt += `\nBramki: ${data.totalGoals}`;
      if (data.goalsHalftime) prompt += ` (do przerwy: ${data.goalsHalftime})`;
      if (data.totalGoals || data.goalsHalftime) prompt += `.`;
  
      if (data.scorers) prompt += `\nStrzelcy: ${data.scorers}.`;
      if (data.cards) prompt += `\nKartki: ${data.cards}.`;
      if (data.mvp) prompt += `\nMVP: ${data.mvp}.`;
      if (data.starA) prompt += `\nSuperStar ${data.teamA}: ${data.starA}.`;
      if (data.starB) prompt += `\nSuperStar ${data.teamB}: ${data.starB}.`;
      if (data.referee) prompt += `\nSędzia: ${data.referee}.`;
      if (data.placeA || data.placeB) {
        prompt += `\nMiejsca w tabeli:`;
        if (data.placeA) prompt += ` ${data.teamA} - ${data.placeA}`;
        if (data.placeB) prompt += `, ${data.teamB} - ${data.placeB}`;
        prompt += `.`;
      }
      if (data.events) prompt += `\nDodatkowe wydarzenia: ${data.events}.`;
      if (style === "poziom" && data.matchLevel) {
        prompt += `\nPoziom meczu: ${data.matchLevel}.`;
      }
  
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9
          })
        });
  
        const json = await res.json();
        const aiText = json.choices?.[0]?.message?.content;
  
        if (json.error || !aiText) {
          summaryDiv.textContent = `Błąd API: ${json.error?.message || "Brak odpowiedzi z AI"}`;
          finish();
        } else {
          typeText(summaryDiv, aiText, 0, () => {
            showAIWarning();
            finish();
          });
        }
      } catch (e) {
        summaryDiv.textContent = `Błąd połączenia: ${e.message}`;
        finish();
      }
    }
  }
  
  function typeText(element, text, i = 0, onDone = () => {}) {
    element.textContent = "";
    let index = i;
    function typer() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(typer, 15);
      } else {
        onDone();
      }
    }
    typer();
  }
  
  function liveUpdate() {
    const data = getData();
    const style = document.getElementById("style").value;
    const preview = generateTemplate(data, style);
    typeLivePreview(preview);
  }
  
  let typingTimeout;
  function typeLivePreview(text) {
    clearTimeout(typingTimeout);
    const el = document.getElementById("livePreview");
    el.textContent = "";
    let i = 0;
    function typer() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        typingTimeout = setTimeout(typer, 20);
      }
    }
    typer();
  }
  
  function generateTemplate(data, style) {
    const warianty = [
      `${data.teamA} vs ${data.teamB} - wynik: ${data.score}. MVP: ${data.mvp}. ${data.events}`,
      `${data.teamA} i ${data.teamB} rozegrali mecz zakończony ${data.score}. Strzelcy: ${data.scorers}.`,
      `Mecz ${data.teamA} - ${data.teamB}: ${data.score}. ${data.mvp} zagrał świetnie!`
    ];
    if (style === "luz") {
      warianty[0] = `Ależ mecz! ${data.teamA} kontra ${data.teamB}, wynik ${data.score}, MVP: ${data.mvp}!`;
      warianty[1] = `${data.teamA} i ${data.teamB} dali show! Strzelcy: ${data.scorers}. Wynik: ${data.score}`;
      warianty[2] = `${data.mvp} pokazał klasę, a wynik meczu to ${data.score}`;
    }
    return warianty[Math.floor(Math.random() * warianty.length)];
  }
  
  function toggleTheme() {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    document.getElementById("themeLabel").textContent = isLight ? "Dzienny" : "Nocny";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light");
      document.getElementById("themeLabel").textContent = "Dzienny";
    }
  });
  
  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      document.getElementById("generateBtn").click();
    }
  });
  
  function copySummary() {
    const text = document.getElementById("summary").textContent;
    if (!text.trim()) {
      showToast("ℹ️ Najpierw wygeneruj podsumowanie.", "info");
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("✅ Podsumowanie skopiowane do schowka!", "success");
      })
      .catch(err => {
        console.error("Błąd kopiowania:", err);
      });
  }
  
  function toggleAdvanced() {
    const advanced = document.getElementById("advancedFields");
    const btn = document.getElementById("toggleAdvancedBtn");
    if (advanced.style.display === "none" || advanced.style.display === "") {
      advanced.style.display = "block";
      btn.textContent = "🔼 Ukryj dodatkowe opcje";
    } else {
      advanced.style.display = "none";
      btn.textContent = "🔽 Pokaż więcej opcji";
    }
  }
  
  function openLeague(url) {
    window.open(url, "_blank");
  }
  
  function showAIWarning() {
    const warning = document.getElementById("aiWarning");
    warning.style.display = "block";
    warning.classList.remove("fade-out");
  
    setTimeout(() => {
      warning.classList.add("fade-out");
    }, 7000);
  
    setTimeout(() => {
      warning.style.display = "none";
      warning.classList.remove("fade-out");
    }, 10000);
  }
  
  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
  
  function switchMode(mode, btn = null) {
    document.getElementById("summaryForm").style.display = mode === "summary" ? "block" : "none";
    document.getElementById("previewForm").style.display = mode === "preview" ? "block" : "none";
  
    // Zmień aktywną zakładkę
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => tab.classList.remove("active"));
    if (btn) btn.classList.add("active");
  }
  
  
  // GENERATOR zapowiedzi meczu (offline wersja)
  function generatePreview() {
    const teamA = document.getElementById("prevTeamA").value;
    const teamB = document.getElementById("prevTeamB").value;
    const date = document.getElementById("matchDate").value;
    const time = document.getElementById("matchTime").value;
    const venue = document.getElementById("venue").value;
    const formA = document.getElementById("formA").value;
    const formB = document.getElementById("formB").value;
    const keyPlayers = document.getElementById("keyPlayers").value;
    const coachComment = document.getElementById("coachComment").value;
    const prediction = document.getElementById("prediction").value;
    const style = document.getElementById("previewStyle").value;
  
    if (!teamA || !teamB || !date || !time) {
      showToast("⚠️ Uzupełnij podstawowe pola: drużyny, data i godzina meczu.", "warning");
      return;
    }
  
    let styleText = "";
    switch (style) {
      case "luz": styleText = "w lekkim, zabawnym stylu"; break;
      case "dziennikarz": styleText = "jak profesjonalny dziennikarz sportowy"; break;
      case "emocjonujacy": styleText = "emocjonująco i z pasją"; break;
      default: styleText = "w poważnym, rzeczowym tonie"; break;
    }
  
    const prompt = `
  Napisz zapowiedź meczu piłkarskiego pomiędzy ${teamA} a ${teamB}, który odbędzie się ${date} o godzinie ${time} na stadionie ${venue}.
  Forma drużyn: ${teamA}: ${formA}, ${teamB}: ${formB}.
  Kluczowi zawodnicy: ${keyPlayers}.
  ${coachComment ? "Komentarz trenera: " + coachComment : ""}
  Przewidywany wynik: ${prediction}.
  Styl: ${styleText}.
    `.trim();
  
    const previewOutput = document.getElementById("previewOutput");
    previewOutput.textContent = "";
    typeText(previewOutput, prompt, 0);
  }
  

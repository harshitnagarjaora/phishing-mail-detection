document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("submission-form");
    if (form) {
        form.addEventListener("submit", handleSubmit);
    }

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});

function handleSubmit(event) {
    event.preventDefault();
    
    const inputContent = document.getElementById("input-content").value.trim();
    const resultElement = document.getElementById("result");
    
    if (!inputContent) {
        showResult("⚠ Please enter an email content to analyze.", "error");
        return;
    }

    // Show loading state
    resultElement.innerHTML = `
        <div class="loading-text">
            <div class="loading"></div>
            Analyzing email content...
        </div>
    `;

    fetch("/predict/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email_text: inputContent })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showResult(`❌ Error: ${data.error}`, "error");
        } else {
            displayDetailedResult(data);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showResult("❌ Error analyzing input. Please try again.", "error");
    });
}

function showResult(message, type) {
    const resultElement = document.getElementById("result");
    resultElement.innerHTML = `<p style="color: ${type === "error" ? "red" : "green"}">${message}</p>`;
}

function displayDetailedResult(data) {
    const resultElement = document.getElementById("result");
    const isPhishing = data.prediction === "Phishing Email";
    
    let featuresHTML = '';
    if (data.features) {
        featuresHTML = `
            <div class="result-features">
                <p>Analysis details:</p>
                <ul>
                    <li>Email length: ${data.features.length} characters</li>
                    <li>Links found: ${data.features.num_links}</li>
                    <li>Sensitive keywords: ${data.features.sensitive_keywords}</li>
                </ul>
            </div>
        `;
    }

    resultElement.innerHTML = `
        <div style="color: ${isPhishing ? 'red' : 'green'}">
            <p class="result-title">${isPhishing ? '⚠ Phishing Email Detected' : '✓ Safe Email'}</p>
            <p class="result-confidence">Confidence: ${(data.confidence * 100).toFixed(2)}%</p>
            ${featuresHTML}
            ${isPhishing ? '<p>This email shows characteristics commonly found in phishing attempts. Be cautious!</p>' : 
                          '<p>This email appears to be safe based on our analysis.</p>'}
        </div>
    `;
}
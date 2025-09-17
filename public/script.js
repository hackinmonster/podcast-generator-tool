// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

const topicInput = document.getElementById('topicInput');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const generateBtn = document.getElementById('generateBtn');
const newTopicBtn = document.getElementById('newTopicBtn');
const retryBtn = document.getElementById('retryBtn');

const clarificationQuestions = document.getElementById('clarificationQuestions');
const discoverSourcesList = document.getElementById('discoverSourcesList');
const createPodcastList = document.getElementById('createPodcastList');
const errorMessage = document.getElementById('errorMessage');

// State
let currentTopic = '';
let currentQuestions = [];
let currentClarifications = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Topic input validation
    topicInput.addEventListener('input', () => {
        const value = topicInput.value.trim();
        nextBtn.disabled = value.length < 5;
    });

    // Navigation buttons
    nextBtn.addEventListener('click', async () => {
        currentTopic = topicInput.value.trim();
        await generateClarificationQuestions();
    });

    backBtn.addEventListener('click', () => {
        showStep(1);
    });

    generateBtn.addEventListener('click', generatePrompts);
    newTopicBtn.addEventListener('click', resetToStart);
    retryBtn.addEventListener('click', () => {
        // Retry the last action based on current state
        if (currentQuestions.length === 0) {
            generateClarificationQuestions();
        } else {
            generatePrompts();
        }
    });

    // Enter key support
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled) {
            nextBtn.click();
        }
    });
}

async function generateClarificationQuestions() {
    try {
        showLoading();

        const response = await fetch('/api/generate-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: currentTopic
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate clarification questions');
        }

        currentQuestions = data.questions;
        setupClarificationQuestions();
        showStep(2);

    } catch (err) {
        console.error('Error generating clarification questions:', err);
        showError(err.message || 'Failed to generate clarification questions. Please try again.');
    }
}

function setupClarificationQuestions() {
    clarificationQuestions.innerHTML = currentQuestions.map((q, index) => `
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">${q.question}</label>
            <input 
                type="text" 
                id="clarification-${index}"
                placeholder="${q.placeholder}"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>
    `).join('');
}

function showStep(stepNumber) {
    // Hide all steps
    [step1, step2, step3, loading, error].forEach(el => el.classList.add('hidden'));
    
    // Show target step
    switch(stepNumber) {
        case 1:
            step1.classList.remove('hidden');
            break;
        case 2:
            step2.classList.remove('hidden');
            break;
        case 3:
            step3.classList.remove('hidden');
            break;
    }
}

function showLoading() {
    [step1, step2, step3, error].forEach(el => el.classList.add('hidden'));
    loading.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    [step1, step2, step3, loading].forEach(el => el.classList.add('hidden'));
    error.classList.remove('hidden');
}

async function generatePrompts() {
    try {
        // Collect clarifications
        currentClarifications = currentQuestions.map((q, index) => {
            const input = document.getElementById(`clarification-${index}`);
            return {
                question: q.question,
                answer: input.value.trim()
            };
        }).filter(c => c.answer); // Only include answered questions

        showLoading();

        const response = await fetch('/api/generate-prompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: currentTopic,
                clarifications: currentClarifications
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate prompts');
        }

        displayResults(data);
        showStep(3);

    } catch (err) {
        console.error('Error generating prompts:', err);
        showError(err.message || 'Something went wrong. Please try again.');
    }
}

function displayResults(data) {
    // Display discover sources prompts
    discoverSourcesList.innerHTML = data.discoverSources.map((prompt, index) => `
        <div class="bg-gray-50 rounded-lg border p-4 mb-3">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <span class="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">Module ${index + 1}</span>
                    </div>
                    <p class="text-sm text-gray-800 leading-relaxed">${escapeHtml(prompt)}</p>
                </div>
                <button 
                    onclick="copyToClipboard('${escapeForJs(prompt)}')"
                    class="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // Display create podcast prompts
    createPodcastList.innerHTML = data.createPodcast.map((prompt, index) => `
        <div class="bg-gray-50 rounded-lg border p-4 mb-3">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <span class="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">Module ${index + 1}</span>
                    </div>
                    <p class="text-sm text-gray-800 leading-relaxed">${escapeHtml(prompt)}</p>
                </div>
                <button 
                    onclick="copyToClipboard('${escapeForJs(prompt)}')"
                    class="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Show temporary success feedback
        const button = event.target.closest('button');
        const originalColor = button.className;
        button.className = button.className.replace('text-gray-400 hover:text-gray-600', 'text-green-500');
        
        setTimeout(() => {
            button.className = originalColor;
        }, 1000);
        
    } catch (err) {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function resetToStart() {
    currentTopic = '';
    currentQuestions = [];
    currentClarifications = [];
    topicInput.value = '';
    nextBtn.disabled = true;
    
    showStep(1);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function escapeForJs(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
} 
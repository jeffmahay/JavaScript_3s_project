// Define constants and variables
const deckUrl = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
let deckId;
let discardPile;
let pileName = "discard";

// DOM elements
const newGameButton = document.querySelector(".new-game");
const drawTitleElement = document.querySelector(".draw-title");
const drawPileElement = document.querySelector(".draw-pile");
const drawButton = document.querySelector(".draw");
const cardsRemainingElement = document.querySelector(".cards-remaining");
const opponentHandElement = document.querySelector(".opponent-hand");
const discardTitleElement = document.querySelector(".discard-title");
const discardPileElement = document.querySelector(".discard-pile");
const loseButton = document.querySelector(".lose-button");
const handTitleElement = document.querySelector(".hand-title");
const playerHandElement = document.querySelector(".player-hand");

// Event listeners
newGameButton.addEventListener("click", initializeGame);
drawButton.addEventListener("click", drawCard);
loseButton.addEventListener("click", loseCond);

// Initialize the game
async function initializeGame() {
  // Fetch and shuffle the deck
  try {
    const response = await fetch(deckUrl);
    const deckDetails = await response.json();
    deckId = deckDetails.deck_id;

    // Display the draw button
    drawButton.removeAttribute("hidden");
    loseButton.removeAttribute("hidden");

    // Clear and set up the UI for a new game
    clearUI();
    drawTitleElement.textContent = "Draw Pile";
    cardsRemainingElement.textContent = "Cards remaining: 52";
    
    // Create discard pile title
    handTitleElement.innerHTML = 'Player Hand';

    // Create player hand title
    discardTitleElement.innerHTML = 'Discard Pile';
    
    // Generate an img of the back of a card
    generateBackOfCard();

    for (let i = 0; i < 3; i++){
      await drawCard();
    }
  } 
  catch (error) {
    console.error("Failed to initialize the game:", error);
  }
}

// Clear UI elements when starting a new game
function clearUI() {
  drawPileElement.innerHTML = "";
  playerHandElement.innerHTML = "";
  discardPileElement.innerHTML = "";
  handTitleElement.innerHTML = "";
}
  
// Draw a card
async function drawCard() {
  // Make API call
  const cardUrl = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`; 
  const response = await fetch(cardUrl);
  const card = await response.json();

  // Put API values into variables
  const cardDetails = card.cards[0];
  const cardsLeft = card.remaining;

  // Create a card container to hold the card and button
  const cardContainer = document.createElement('div');

  // Create a card element
  const cardElement = document.createElement('img');
  cardElement.src = cardDetails.image;

  // Create a button element for the card
  const cardButton = document.createElement('button');
  cardButton.textContent = 'Move to Discard Pile';

  // Make button move card to discard pile
  cardButton.addEventListener('click', async function () {
      // Make API call and define card ID
      const cardId = cardDetails.code;
      const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/add/?cards=${cardId}`);
      const discard = await response.json();

      // Remove card from hand
      cardContainer.remove();

      // Add card img to discard pile
      generateDiscardPile();
  }
  )

  // Append the card and button to the card container
  cardContainer.appendChild(cardElement);
  cardContainer.appendChild(cardButton);

  // Append the card container to the div
  playerHandElement.appendChild(cardContainer);

  // Update the remaining cards count
  cardsRemainingElement.innerHTML = `Cards remaining: ${cardsLeft}`;
}

// Generate the back of a card
async function generateBackOfCard() {
  // Make API call
  const cardBackUrl = "https://deckofcardsapi.com/static/img/back.png";

  // Create an img element
  const cardBackImage = document.createElement('img');
  cardBackImage.src = cardBackUrl;

  // Add img to the div
  drawPileElement.appendChild(cardBackImage);
}

// Generate the discard pile
async function generateDiscardPile() {
  // Make API call
  const pileUrl = `https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/list/`;
  const response = await fetch(pileUrl);
  const discardList = await response.json();

  discardPile = discardList.piles.discard.remaining

  // Define variable for the top of the pile
  const lastCard = discardList.piles.discard.cards[discardList.piles.discard.cards.length - 1];
  
  // Create img element
  const cardElement = document.createElement('img');
  cardElement.src = lastCard.image;

  // Remove previous image and add the new one
  discardPileElement.innerHTML = '';
  discardPileElement.appendChild(cardElement);
}

// Adds cards to opponent's hand
async function opponentDraw(){
  // Make API call
  const cardUrl = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`; 
  const response = await fetch(cardUrl);
  const card = await response.json();

  // Put API values into variables
  const cardDetails = card.cards[0];
  const cardId = cardDetails.code
  const cardsLeft = card.remaining;

  // Create list to hold opponent's cards
  const opponentHand = new Array()

  // Update the remaining cards count
  cardsRemainingElement.innerHTML = `Cards remaining: ${cardsLeft}`;
}

// Put all cards in discard into hand
async function loseCond(){
  // Make API call
  const discardUrl = `https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/draw/?count=${discardPile}`;
  const response = await fetch(discardUrl);
  const card = await response.json();

  // Create array to hold card list
  const cardList = card.cards;

  // Add every card in the discard pile into the hand
  for (let i = 0; i < cardList.length; i++) {
    // Get each card into a variable
    const cardDetails = cardList[i]

    // Create a card container to hold the card and button
    const cardContainer = document.createElement('div');

    // Create a card element
    const cardElement = document.createElement('img');
    cardElement.src = cardDetails.image;

    // Create a button element for the card
    const cardButton = document.createElement('button');
    cardButton.textContent = 'Move to Discard Pile';

    // Make button move card to discard pile
    cardButton.addEventListener('click', async function () {
        // Make API call and define card ID
        const cardId = cardDetails.code;
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/add/?cards=${cardId}`);
        const discard = await response.json();

        // Remove card from hand
        cardContainer.remove();

        // Add card img to discard pile
        generateDiscardPile();
    }
    )

    // Append the card and button to the card container
    cardContainer.appendChild(cardElement);
    cardContainer.appendChild(cardButton);

    // Append the card container to the div
    playerHandElement.appendChild(cardContainer);
  }

  // Empty the discard pile
  discardPileElement.innerHTML = '';

}

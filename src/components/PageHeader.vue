<script setup lang="ts">
  import { ref } from 'vue';
  defineProps<{ name: string }>();

  window.addEventListener('resize', () => {
    const root = document.querySelector(':root');
    if (root instanceof HTMLElement) root.style.setProperty('--vh', window.innerHeight/100 + 'px');
  });


  const attribute = ref('');
  const personalAttributes: string[] = [
    "Software Engineer",
    "Vector Artist",
    "Video Editor",
    "Voice Actor",
    "Tim",
    "hard worker",
    "team leader",
    "creative",
    "perfectionist",
    "logical thinker",
    "creative thinker",
    "learner"
  ];

  attribute.value = personalAttributes[0];

  const animationDelay = 3;
  let typingCheck = false;
  const typingEffect = (i: number, char: number) => {
    if (typingCheck) {
      if (attribute.value.length < personalAttributes[i].length) {
        attribute.value += personalAttributes[i].charAt(char);
        setTimeout(() => typingEffect(i % personalAttributes.length, ++char), 50);
      } else {
        typingCheck = false;
        setTimeout(() => typingEffect(i % personalAttributes.length, 0), animationDelay * 1000);
      }
    } else {
      if (attribute.value.length > 0) {
        attribute.value = attribute.value.slice(0, -1);
        setTimeout(() => typingEffect(i % personalAttributes.length, 0), 50);
      } else {
        typingCheck = true
        let nextAttribute = Math.floor(Math.random() * personalAttributes.length);
        if (nextAttribute == i) nextAttribute = ++i % personalAttributes.length; // If duplicate, choose the next one
        setTimeout(() => typingEffect(nextAttribute, 0), 500);
      };
    }
  };
  setTimeout(() => typingEffect(0, 0), animationDelay * 1500);
</script>

<template>
  <header>
    <div id="headerLogo">
      <a href="https://www.linkedin.com/in/timchinye/" target="_blank">
        <img src="../assets/TigerYT PFP.svg" alt="Tim's logo" :style="{ animationDuration: (animationDelay / 2) + 's' }" />
      </a>
    </div>

    <div id="headerText">
      <h1 :style="{ animationDelay: (animationDelay / 2) + 's', animationDuration: animationDelay + 's' }">{{ name }}</h1>
      <p id="jobTitle" :style="{ animationDelay: (animationDelay / 2) + 's', animationDuration: animationDelay + 's' }">Not just a {{ attribute }}</p>
    </div>
  </header>
</template>

<style scoped>
  header {
    height: calc(var(--vh, 1vh) * 100);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1vh;
  }

  @media (orientation: landscape) {
    header {
      flex-direction: row;
      gap: 1vw;
    }
  }

  #headerLogo img {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  #headerLogo img:hover {
    filter: drop-shadow(0 0 2em #FC891E);
  }

  @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
  }

  #headerText {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #headerText > h1, #headerText > #jobTitle, #headerLogo img {
    opacity: 0;
    animation-name: fadeIn;
    animation-fill-mode: forwards;
  }

  #headerText > #jobTitle {
    font-family: 'Titillium Web';
    font-weight: 100;
  }

  #headerText > h1 {
    margin: 0;
  }

  @keyframes blink {
    0%, 45% {
      border-color: transparent;
    }
    50%, 100% {
      border-color: white;
    }
  }

  #jobTitle {
    animation: typing 2s steps(30) forwards, blink 1s infinite;
  }
</style>
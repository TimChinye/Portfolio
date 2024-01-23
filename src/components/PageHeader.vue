<script setup lang="ts">
	import { ref } from 'vue';
	defineProps<{ name: string }>();

	setInterval((function timeBasedHeights() {
		const currentTime: Date = new Date();

		const ss: StyleSheetList = document.styleSheets;
		for (let i = 0; i < ss.length; i++) {
			const rules: CSSRuleList = ss[i].cssRules;
			for (let j = 0; j < rules.length; j++) {
				const r: CSSRule = rules[j] as CSSStyleRule;
				if (!( r instanceof CSSStyleRule)) continue;
				if (r.selectorText?.startsWith("#headerOffsets") && r.selectorText?.endsWith(" > :first-child::after")) {
					console.log(r.style.cssText);
					(r as CSSStyleRule).style.cssText = "animation-delay: 0s, 1.5s; --height: " + (currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600) * 8 + "px;";
				} else if (r.selectorText?.startsWith("#headerOffsets") && r.selectorText?.endsWith(" > :last-child::after")) {
					(r as CSSStyleRule).style.cssText = "animation-delay: 0s, 1.5s; --height: " + (currentTime.getMinutes() + currentTime.getSeconds() / 60) * 3 + "px;";
				}
			}
		}
		return timeBasedHeights;
	})(), 1000);

	const attribute = ref('');
	const personalAttributes: string[] = [
		"a Software Engineer",
		"a Vector Artist",
		"a Video Editor",
		"a Voice Actor",
		"a Tim",
		"a hard worker",
		"a team leader",
		"a perfectionist",
		"a logical thinker",
		"a creative thinker",
		"an enthusiastic learner"
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
		<nav>

		</nav>

		<div id="headerLogo">
			<a href="https://www.linkedin.com/in/timchinye/" target="_blank">
				<img src="../assets/TigerYT PFP.svg" alt="Tim's logo" :style="{ animationDuration: (animationDelay / 2) + 's' }" />
			</a>
		</div>

		<div id="headerText">
			<h1 :style="{ animationDelay: (animationDelay / 2) + 's', animationDuration: animationDelay + 's' }">{{ name }}</h1>
			<p id="jobTitle" :style="{ animationDelay: (animationDelay / 2) + 's', animationDuration: animationDelay + 's' }">Not just {{ attribute }}</p>
		</div>

		<div id="headerOffsets">
			<div>
				<a href="tel:+447778563829"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M96 16c-44.183 0-80 35.817-80 80 0 13.12 3.163 25.517 8.771 36.455l-8.608 36.155a6.002 6.002 0 0 0 7.227 7.227l36.155-8.608C70.483 172.837 82.88 176 96 176c44.183 0 80-35.817 80-80s-35.817-80-80-80ZM28 96c0-37.555 30.445-68 68-68s68 30.445 68 68-30.445 68-68 68c-11.884 0-23.04-3.043-32.747-8.389a6.003 6.003 0 0 0-4.284-.581l-28.874 6.875 6.875-28.874a6.001 6.001 0 0 0-.581-4.284C31.043 119.039 28 107.884 28 96Zm46.023 21.977c11.975 11.974 27.942 20.007 45.753 21.919 11.776 1.263 20.224-8.439 20.224-18.517v-6.996a18.956 18.956 0 0 0-13.509-18.157l-.557-.167-.57-.112-8.022-1.58a18.958 18.958 0 0 0-15.25 2.568 42.144 42.144 0 0 1-7.027-7.027 18.958 18.958 0 0 0 2.569-15.252l-1.582-8.021-.112-.57-.167-.557A18.955 18.955 0 0 0 77.618 52H70.62c-10.077 0-19.78 8.446-18.517 20.223 1.912 17.81 9.944 33.779 21.92 45.754Zm33.652-10.179a6.955 6.955 0 0 1 6.916-1.743l8.453 1.665a6.957 6.957 0 0 1 4.956 6.663v6.996c0 3.841-3.124 6.995-6.943 6.585a63.903 63.903 0 0 1-26.887-9.232 64.594 64.594 0 0 1-11.661-9.241 64.592 64.592 0 0 1-9.241-11.661 63.917 63.917 0 0 1-9.232-26.888C63.626 67.123 66.78 64 70.62 64h6.997a6.955 6.955 0 0 1 6.66 4.957l1.667 8.451a6.956 6.956 0 0 1-1.743 6.917l-1.12 1.12a5.935 5.935 0 0 0-1.545 2.669c-.372 1.403-.204 2.921.603 4.223a54.119 54.119 0 0 0 7.745 9.777 54.102 54.102 0 0 0 9.778 7.746c1.302.806 2.819.975 4.223.603a5.94 5.94 0 0 0 2.669-1.545l1.12-1.12Z" /></svg></a>
				<!-- Generate/fetch an invite link on a weekly basis -->		
				<a href="https://discord.com/users/209228442816741376/"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.8943 4.34399C17.5183 3.71467 16.057 3.256 14.5317 3C14.3396 3.33067 14.1263 3.77866 13.977 4.13067C12.3546 3.89599 10.7439 3.89599 9.14391 4.13067C8.99457 3.77866 8.77056 3.33067 8.58922 3C7.05325 3.256 5.59191 3.71467 4.22552 4.34399C1.46286 8.41865 0.716188 12.3973 1.08952 16.3226C2.92418 17.6559 4.69486 18.4666 6.4346 19C6.86126 18.424 7.24527 17.8053 7.57594 17.1546C6.9466 16.92 6.34927 16.632 5.77327 16.2906C5.9226 16.184 6.07194 16.0667 6.21061 15.9493C9.68793 17.5387 13.4543 17.5387 16.889 15.9493C17.0383 16.0667 17.177 16.184 17.3263 16.2906C16.7503 16.632 16.153 16.92 15.5236 17.1546C15.8543 17.8053 16.2383 18.424 16.665 19C18.4036 18.4666 20.185 17.6559 22.01 16.3226C22.4687 11.7787 21.2836 7.83202 18.8943 4.34399ZM8.05593 13.9013C7.01058 13.9013 6.15725 12.952 6.15725 11.7893C6.15725 10.6267 6.98925 9.67731 8.05593 9.67731C9.11191 9.67731 9.97588 10.6267 9.95454 11.7893C9.95454 12.952 9.11191 13.9013 8.05593 13.9013ZM15.065 13.9013C14.0196 13.9013 13.1652 12.952 13.1652 11.7893C13.1652 10.6267 13.9983 9.67731 15.065 9.67731C16.121 9.67731 16.985 10.6267 16.9636 11.7893C16.9636 12.952 16.1317 13.9013 15.065 13.9013Z" /></svg></a>
				<a href="https://github.com/timchinye"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.475 2 2 6.475 2 12C2 16.425 4.8625 20.1625 8.8375 21.4875C9.3375 21.575 9.525 21.275 9.525 21.0125C9.525 20.775 9.5125 19.9875 9.5125 19.15C7 19.6125 6.35 18.5375 6.15 17.975C6.0375 17.6875 5.55 16.8 5.125 16.5625C4.775 16.375 4.275 15.9125 5.1125 15.9C5.9 15.8875 6.4625 16.625 6.65 16.925C7.55 18.4375 8.9875 18.0125 9.5625 17.75C9.65 17.1 9.9125 16.6625 10.2 16.4125C7.975 16.1625 5.65 15.3 5.65 11.475C5.65 10.3875 6.0375 9.4875 6.675 8.7875C6.575 8.5375 6.225 7.5125 6.775 6.1375C6.775 6.1375 7.6125 5.875 9.525 7.1625C10.325 6.9375 11.175 6.825 12.025 6.825C12.875 6.825 13.725 6.9375 14.525 7.1625C16.4375 5.8625 17.275 6.1375 17.275 6.1375C17.825 7.5125 17.475 8.5375 17.375 8.7875C18.0125 9.4875 18.4 10.375 18.4 11.475C18.4 15.3125 16.0625 16.1625 13.8375 16.4125C14.2 16.725 14.5125 17.325 14.5125 18.2625C14.5125 19.6 14.5 20.675 14.5 21.0125C14.5 21.275 14.6875 21.5875 15.1875 21.4875C17.1727 20.8173 18.8977 19.5415 20.1198 17.8395C21.3419 16.1376 21.9995 14.0953 22 12C22 6.475 17.525 2 12 2Z" /></svg></a>
				<a href="https://www.linkedin.com/in/timchinye/"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M22 3.47059V20.5294C22 20.9194 21.845 21.2935 21.5692 21.5693C21.2935 21.8451 20.9194 22 20.5294 22H3.47056C3.08053 22 2.70648 21.8451 2.43069 21.5693C2.15491 21.2935 1.99997 20.9194 1.99997 20.5294V3.47059C1.99997 3.08056 2.15491 2.70651 2.43069 2.43073C2.70648 2.15494 3.08053 2 3.47056 2H20.5294C20.9194 2 21.2935 2.15494 21.5692 2.43073C21.845 2.70651 22 3.08056 22 3.47059V3.47059ZM7.88232 9.64706H4.94115V19.0588H7.88232V9.64706ZM8.14703 6.41176C8.14858 6.18929 8.10629 5.96869 8.02258 5.76255C7.93888 5.55642 7.81539 5.36879 7.65916 5.21039C7.50294 5.05198 7.31705 4.92589 7.1121 4.83933C6.90715 4.75277 6.68715 4.70742 6.46468 4.70588H6.41173C5.95931 4.70588 5.52541 4.88561 5.20549 5.20552C4.88558 5.52544 4.70585 5.95934 4.70585 6.41176C4.70585 6.86419 4.88558 7.29809 5.20549 7.61801C5.52541 7.93792 5.95931 8.11765 6.41173 8.11765V8.11765C6.63423 8.12312 6.85562 8.0847 7.06325 8.00458C7.27089 7.92447 7.46071 7.80422 7.62186 7.65072C7.78301 7.49722 7.91234 7.31346 8.00245 7.10996C8.09256 6.90646 8.14169 6.6872 8.14703 6.46471V6.41176ZM19.0588 13.3412C19.0588 10.5118 17.2588 9.41177 15.4706 9.41177C14.8851 9.38245 14.3021 9.50715 13.7798 9.77345C13.2576 10.0397 12.8142 10.4383 12.4941 10.9294H12.4117V9.64706H9.64703V19.0588H12.5882V14.0529C12.5457 13.5403 12.7072 13.0315 13.0376 12.6372C13.368 12.2429 13.8407 11.9949 14.3529 11.9471H14.4647C15.4 11.9471 16.0941 12.5353 16.0941 14.0176V19.0588H19.0353L19.0588 13.3412Z"/></svg></a>
			</div>
			<a href="mailto:timchinye123@gmail.com">timchinye123@gmail.com</a>
		</div>
	</header>
</template>

<style scoped>
	header {
		position: relative;
		width: 100dvw;
		height: 100dvh;
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
		filter: drop-shadow(0 0 2em var(--accent-color));
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
		text-align: center;
	}

	#headerText > h1 {
		margin: 0;
	}

	@keyframes scaling {
			from { height: var(--height); }
			to   { height: calc(var(--height) - 16px); }
	}

	@keyframes scaleUp {
			from { height: 0; }
			to   { height: var(--height); }
	}

	#headerOffsets > * {
		display: flex;
		position: absolute;
		bottom: 0;
	}

	#headerOffsets > *::after {
		position: relative;
		content: '';
		width: 0;
		margin: 8px auto 16px;
		border: #BAB9B8 solid 1px;
		animation-name: scaleUp, scaling;
		animation-duration: 1.5s, 2.5s;
		animation-timing-function: linear, cubic-bezier(0.5, 0.25, 0.5, 0.75);
		animation-iteration-count: 1, infinite;
		animation-direction: normal, alternate;
		animation-fill-mode: forwards;
	}

	#headerOffsets > :first-child::after {
		all: unset;
		/* Set the time-based height of the line & delay for the initial animation */
	}

	#headerOffsets > :last-child::after {
		all: unset;
		/* Set the time-based height of the line & delay for the initial animation */
	}

	#headerOffsets > :first-child {
		left: 32px;
		flex-direction: column;
		color: #BAB9B8;
		transition: 0.5s;
	}

	#headerOffsets svg {
		height: 2.5rem;
		width: 2.5rem;
		stroke: var(--icon-color);
		stroke-width: 1px;
		transition: 0.5s;
		--icon-color: #BAB9B8;
	}

	#headerOffsets :first-child > svg {
		stroke: var(--background-color);
		stroke-linejoin: round;
		stroke-width: 2px;
		fill: var(--icon-color);
	}

	#headerOffsets svg:hover {
		--icon-color: var(--accent-color);
	}

	#headerOffsets > :last-child {
		right: 32px;
		writing-mode: vertical-lr;
		color: #BAB9B8;
		text-decoration: none;
		transition: 0.5s;
	}

	#headerOffsets > :last-child:hover {
		color: var(--accent-color);
	}
</style>

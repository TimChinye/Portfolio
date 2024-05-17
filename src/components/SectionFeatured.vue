<script setup lang="ts">
</script>

<template>
	<section>
		<!-- Featured Projects -->
		 <article id="featured">
			<header>
				<span></span>
				<div>3 MOST RECENT PROJECTS</div>
				<span></span>
			</header>
			<main>
				<div>
					<!-- This website -->
					<div class="content">
						<h2>Portfolio</h2>
						<p>An open-source website to clearly demostrate how I code and showcase my skills to recruiters in a minimalistic, straight-to-the-point manner.<br><br>This project proves that I am up to date with the latest web technologies, designs and conventions.</p>
						<ul>
							<li>HTML, CSS & JS</li>
							<li>TypeScript</li>
							<li>Vue.js (& Vite)</li>
							<li>Node.js</li>
							<li>Git & Github</li>
							<li>Font Awesome</li>
							<li>Vercel</li>
						</ul>
						<div>
							<a href="https://www.google.com/" target="_blank" @mouseenter="jumpAnimation" @mouseleave="stopAnimation"><font-awesome-icon icon="fa-brands fa-github" /></a>
							<a href="https://www.google.com/" target="_blank" @mouseenter="jumpAnimation" @mouseleave="stopAnimation"><font-awesome-icon icon="fa-solid fa-angles-up" /></a>
						</div>
					</div>
					<img src="../assets/portfolio.png">
				</div>
				<div>
					<!-- C# Computer Project -->
					<div class="content">
						<h2>Unnamed C# Console Application</h2>
						<p usage="description of the project">Tasked at university to make a program with 4 functions; 1. A menu selector, 2. Trinary Converter, 3. School Roster 4, ISBN Verifier.<br><br>I did this to an exceptional first-class level as I show off several tools and techniques in C# that I learnt through self-study.<br><br>In addition to this, I built a simulation of a computer screen display to view the program and a number of other fun features.</p>
						<ul>
							<li>C#</li>
							<li>.NET</li>
							<li>Android</li>
							<li>Console / CLI</li>
						</ul>
						<div>
							<a href="https://www.google.com/" target="_blank" @mouseenter="jumpAnimation" @mouseleave="stopAnimation"><font-awesome-icon icon="fa-brands fa-github" /></a>
						</div>
					</div>
					<img src="../assets/uniproject.png">
				</div>
				<div>
					<!-- CreatorTube -->
					<div class="content">
						<h2>CreatorTube</h2>
						<p usage="description of the project">A closed-source android mobile app that I've designed and developed both the front and back ends for.<br><br>This projects has allowed me to further my knowledge on Java and build upon my understanding of mobile app development.</p>
						<ul>
							<li>SQL</li>
							<li>Java</li>
							<li>Android</li>
							<li>Git & Github</li>
							<li>Postman</li>
							<li>Console / CLI</li>
							<li>Icons8</li>
							<li>Vercel</li>
						</ul>
						<div>
							<!-- <a usage="a link to google play store"></a> -->
						</div>
					</div>
					<img src="../assets/creatortube.png">
				</div>
			</main>
		</article>
	</section>
</template>

<script lang="ts">
	export default {
		data() {
			return {
				counts: new Map(),
			};
		},
		methods: {
			jumpAnimation(event: Event) {
				const target = (event.target as HTMLElement).children[0];

				if (!this.counts.has(target) || this.counts.get(target) == 0) {
					this.counts.set(target, 0);
					target.classList.add('jump-animation');
				}

				this.counts.set(target, this.counts.get(target) + 1);
			},
			stopAnimation(event: Event) {
				const target = (event.target as HTMLElement).children[0];

				if (this.counts.has(target) && this.counts.get(target) > 0) {
					const quitAnimation = () => {
						target.removeEventListener('animationiteration', quitAnimation);
						target.removeEventListener('webkitAnimationIteration', quitAnimation);
						this.counts.set(target, this.counts.get(target) - 1);

						if (this.counts.get(target) == 0) target.classList.remove('jump-animation');
					};

					target.addEventListener('animationiteration', quitAnimation);
					target.addEventListener('webkitAnimationIteration', quitAnimation);
				}
			}
		}
	};
</script>

<style scoped>
    section > #featured {
		width: clamp(1px, 100%, calc(var(--site-width) * 0.50));
    }

    section > #featured > header > div::first-letter {
        font-weight: 300;
    }

    section > #featured > main {
		width: 100%;
        padding: 0 clamp(0px, 2.75dvw, calc(var(--site-width) * 0.0275));
		display: flex;
		flex-direction: column;
		gap: 6rem;
    }

	div:has(.content) {
		position: relative;
		overflow: hidden;
	}

	section > #featured > main > div img {
		position: absolute;
		transform: translateY(-50%);
		top: 50%;
		width: calc((100% / 7) * 4);
		filter: brightness(0.5);
		transition: 1.25s;
	}

	section > #featured > main > div:has(:is(h2, p, ul):hover) img {
		filter: brightness(0.75);
	}

	section > #featured > main >  div:nth-child(3) img {
		filter: brightness(0.25);
	}

	section > #featured > main > div:nth-child(3):has(:is(h2, p, ul):hover) img {
		filter: brightness(0.375);
	}

	section > #featured > main > div {
		border-radius: 0.5rem;
	}

	section > #featured .content {
		width: calc((100% / 5) * 3);
		float: right;
		position: relative;
		z-index: 1;
	}

	section > #featured .content h2 {
		cursor: e-resize;
		transition: 0.5s;
		padding: 1.5em 0;
		margin: 0;
	}
	section > #featured .content h2:hover {
		letter-spacing: 0.125rem;
		transition: 10s;
	}

	section > #featured .content ul {
		list-style-type: none;
		padding: 1rem 0.5rem;
		margin: 0;
		margin-right: 0.5rem;
		display: flex;
		flex-flow: wrap;
		justify-content: right;
		gap: 1rem;
	}

	section > #featured .content li {
		font-size: 0.75rem;
		line-height: 0.75rem;
		white-space: nowrap;
		padding: 0.25rem 0.5rem;
		color: var(--darker-text-colour);
		background: var(--background-colour);
		border: 0.125rem solid var(--line-colour);
		box-shadow: 0 0 0.5rem var(--background-colour);
		border-radius: 0.25rem;
		cursor: pointer;
		position: relative;
		transition: ease-out 0.5s;
		-webkit-transition: ease-out 0.5s;
		-moz-transition: ease-out 0.5s;
	}

	section > #featured .content li::before,
	section > #featured .content li::after {
		position: absolute;
		content: "";
		width: 0;
		height: 0;
		transition: .5s;
	}

	section > #featured .content li::before {
		top: -0.375rem;
		left: -0.375rem;
		border-top: calc(1rem / 16) solid transparent;
		border-left: calc(1rem / 16) solid transparent;
	}

	section > #featured .content li::after {
		bottom: -0.375rem;
		right: -0.375rem;
		border-bottom: calc(1rem / 16) solid transparent;
		border-right: calc(1rem / 16) solid transparent;
	}

	section > #featured .content li:hover {
		color: var(--accent-colour);
	}

	section > #featured .content li:hover::after,
	section > #featured .content li:hover::before {
		width: 0.5rem;
		height: 0.5rem;
		border-color: var(--text-colour);
	}

	section > #featured .content p {
		margin: 0;
		padding: 2.5rem;
		background: var(--panel-colour);
		border-radius: 0.25rem;
		box-shadow: 0 0 1rem var(--panel-shadow-colour);
	}

	section > #featured .content div {
		display: flex;
		justify-content: right;
		gap: 0.5rem;
		padding: 1rem 0.25rem;
	}

	section > #featured .content div svg {
		color: var(--darker-text-colour);
		transition: 0.5s;
		height: 1.5rem;
	}

	section > #featured .content div svg.jump-animation {
-webkit-animation: fa-bounce 1.5s cubic-bezier(0.28, 0.84, 0.42, 1) 0s infinite;
		animation: fa-bounce 1.5s cubic-bezier(0.28, 0.84, 0.42, 1) 0s infinite;
		color: var(--text-colour);
	}

    @media (width <= 720px) {
        section > #featured > header > div {
            width: fit-content;
        }
    }

	@media (width <= 1484px) {
		section > #featured > main > div img {
			width: 100%;
			min-height: 100%;
			filter: brightness(0.25);
			object-fit: cover;
		}
		
		section > #featured > main > div:hover img {
			filter: brightness(0.5);
		}
		
		section > #featured > main > div:nth-child(3) img {
			filter: brightness(0.125);
		}
		
		section > #featured > main > div:nth-child(3):hover img {
			filter: brightness(0.375);
		}

		section > #featured .content {
			width: 100%;
			float: none;
			padding: 2rem;
		}

		section > #featured .content p {
			padding: 0;
			background: none;
			box-shadow: none;
		}
		section > #featured .content ul {
			justify-content: left;
		}

		section > #featured .content li {
			background: color-mix(in srgb, var(--background-colour) 50%, transparent);
			border-color: color-mix(in srgb, var(--line-colour) 75%, transparent);
			box-shadow: 0 0 0.5rem color-mix(in srgb, var(--background-colour) 50%, transparent);
		}
	}

	@media (prefers-color-scheme: light) {
		section > #featured > main > div img {
			filter: contrast(0.5) sepia(1) blur(1px);
		}

		section > #featured > main > div:has(:is(h2, p, ul):hover) img {
			filter: contrast(1) sepia(0) blur(0);
		}

		section > #featured > main > div:nth-child(3) img {
			filter: contrast(0.5) sepia(1) blur(1px);
		}

		section > #featured > main > div:nth-child(3):has(:is(h2, p, ul):hover) img {
			filter: contrast(0.5) sepia(0) blur(0);
		}

		section > #featured .content h2 {
			position: relative;
			padding: 2.25rem;
			box-sizing: border-box;
		}

		section > #featured .content h2:after {
			position: absolute;
			content: '';
			top: 50%;
			left: 0;
			transform: translateY(-50%);
			border-radius: 0.25rem;
			background: var(--panel-colour);
			width: 100%;
			height: calc(100% - 3.5rem);
			z-index: -1;
		}

		section > #featured .content p {
			box-shadow: none;
		}

		@media (width <= 1484px) {
			section > #featured > main > div img {
				width: 100%;
				min-height: 100%;
				filter: sepia(1) brightness(0.25);
				object-fit: cover;
			}
			
			section > #featured > main > div:hover img,
			section > #featured > main > div:has(:is(h2, p, ul):hover) img {
				filter: sepia(1) brightness(0.5);
			}
			
			section > #featured > main > div:nth-child(3) img {
				filter: sepia(1) brightness(0.25);
			}
			
			section > #featured > main > div:nth-child(3):hover img,
			section > #featured > main > div:nth-child(3):has(:is(h2, p, ul):hover) img {
				filter: sepia(1) brightness(calc((1 / 16) * 3));
			}

			section > #featured .content h2 { 
				text-shadow: 0 0 0.5rem var(--text-colour);
			}

			section > #featured .content li {
				box-shadow: 0 0 0.5rem var(--overlay-colour);
				border-color: var(--overlay-colour);
				background: transparent;
			}
		}
	}

	@keyframes fa-bounce {
		0% {
		}

		10% {
			-webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
			transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
		}

		30% {
			-webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
			transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
		}

		50% {
			-webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
			transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
		}

		57% {
			-webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
			transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
		}

		64% {
			-webkit-transform: scale(1, 1) translateY(0);
			transform: scale(1, 1) translateY(0);
		}

		100% {
			-webkit-transform: scale(1, 1) translateY(0);
			transform: scale(1, 1) translateY(0);
		}
	}
</style>

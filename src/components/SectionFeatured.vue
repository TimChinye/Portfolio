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
						<h3>Portfolio</h3>
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
							<a usage="a link to github"><!-- Font Awesome --></a>
							<a usage="a 'link' to scroll to the top (up arrow)"><!-- Font Awesome --></a>
						</div>
					</div>
					<img src="../assets/portfolio.png">
				</div>
				<div>
					<!-- C# Computer Project -->
					<div class="content">
						<h3>Unnamed C# Console Application</h3>
						<p usage="description of the project">Tasked at university to make a program with 4 functions; 1. A menu selector, 2. Trinary Converter, 3. School Roster 4, ISBN Verifier.<br><br>I did this to an exceptional first-class level as I show off several tools and techniques in C# that weren't taught in lectures.<br><br>In addition to this, I built a simulation of a computer screen display to view the program and a number of other fun features.</p>
						<ul>
							<li>C#</li>
							<li>.NET</li>
							<li>Android</li>
							<li>Console / CLI</li>
						</ul>
						<div>
							<a usage="a link to github"><!-- Font Awesome --></a>
							<a usage="a 'link' to scroll to the top (up arrow)"><font-awesome-icon icon="fa-regular fa-circle-up" /></a>
						</div>
					</div>
					<img src="../assets/uniproject.png">
				</div>
				<div>
					<!-- CreatorTube -->
					<div class="content">
						<h3>CreatorTube</h3>
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
							<a usage="a link to github"><!-- Font Awesome --></a>
							<a usage="a 'link' to scroll to the top (up arrow)"><!-- Font Awesome --></a>
						</div>
					</div>
					<img src="../assets/creatortube.png">
				</div>
			</main>
		</article>
	</section>
</template>

<style scoped>
    section > #featured {
		width: 100%;
        max-width: 1280px;
    }

    section > #featured > header > div::first-letter {
        font-weight: 300;
    }

    section > #featured > main {
		width: 100%;
        padding: 0 2.75vw;
		display: flex;
		flex-direction: column;
		gap: 6rem;
    }

	div:has(.content + img) {
		position: relative;
		overflow: hidden;
	}

	section > #featured .content + img {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: calc((100% / 7) * 4);
		filter: brightness(0.5);
		z-index: -1;
	}

	section > #featured > main > div {
		border-radius: 0.5rem;
	}

	section > #featured > main > div:has(:is(h3, p, ul):hover) img {
		filter: brightness(0.75);
	}

	section > #featured div:nth-child(3) img {
		filter: brightness(0.25);
	}

	section > #featured > main > div:nth-child(3):has(:is(h3, p, ul):hover) img {
		filter: brightness(0.375);
	}

	section > #featured .content {
		width: calc((100% / 5) * 3);
		float: right;
	}

	section > #featured .content h3 {
		cursor: e-resize;
		transition: 0.5s;
	}
	section > #featured .content h3:hover {
		letter-spacing: 0.25rem;
		transition: 10s;
	}

	section > #featured .content ul {
		list-style-type: none;
		padding: 0;
		margin: 0.5rem;
		margin-right: 0.5rem;
		display: flex;
		justify-content: right;
		gap: 1rem;
	}

	section > #featured .content li {
		font-size: 0.75rem;
		line-height: 0.75rem;
		white-space: nowrap;
		padding: 0.25rem 0.5rem;
		color: #BAB9B8;
		border: 0.125rem solid var(--divider-color);
		border-radius: 0.25rem;
		cursor: pointer;
		position: relative;
		transition: ease-out 0.5s;
		-webkit-transition: ease-out 0.5s;
		-moz-transition: ease-out 0.5s;
	}

	section > #featured .content li::after,
	section > #featured .content li::before {
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
		font-weight: bold;
	}

	section > #featured .content li:hover::after,
	section > #featured .content li:hover::before {
		width: 0.5rem;
		height: 0.5rem;
		border-color: var(--text-color);
	}

	section > #featured .content p {
		padding: 1.5rem;
		background: #2a2a2a;
		border-radius: 0.25rem;
		box-shadow: 0 0 2rem #1f1f1f;
	}

    @media (width <= 720px) {
        section > #featured > header > div {
            width: min-content;
        }
    }

	@media (width < 1002px) {
		section > #featured .content ul {
			flex-flow: wrap;
			justify-content: left;
		}
		
		section > #featured .content + img {
			width: 100%;
			min-height: 100%;
			filter: brightness(0.25);
			object-fit: cover;
		}
		
		section > #featured div:hover img {
			filter: brightness(0.5) !important;
		}
		
		section > #featured div:nth-child(3) img {
			filter: brightness(0.125);
		}
		
		section > #featured div:nth-child(3):hover img {
			filter: brightness(0.25) !important;
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
	}
</style>
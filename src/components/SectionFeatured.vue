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
						<p>A website to showcase my skills to recruiters in a minimalistic, straight-to-the-point manner. An open-source project built using modern tools and techniques.</p>
						<ul>
							<li>HTML, CSS & JS</li>
							<li>TypeScript</li>
							<li>Vue.js (& Vite)</li>
							<li>Node.js</li>
						</ul>
						<div>
							<a usage="a link to github"><!-- Font Awesome --></a>
							<a usage="a 'link' to scroll to the top (up arrow)"><!-- Font Awesome --></a>
						</div>
					</div>
					<img src="https://placehold.co/600x400?text=This+website">
				</div>
				<div>
					<!-- C# Computer Project -->
					<div class="content">
						<h3>Portfolio</h3>
						<p usage="description of the project">A minimal, dark blue theme for VS Code, Sublime Text, Atom, iTerm, and more. Available on Visual Studio Marketplace, Package Control, Atom Package Manager, and npm.</p>
						<ul>
							<li>HTML, CSS & JS</li>
							<li>TypeScript</li>
							<li>Vue.js (& Vite)</li>
							<li>Node.js</li>
						</ul>
						<div>
							<a usage="a link to github"><!-- Font Awesome --></a>
							<a usage="a 'link' to scroll to the top (up arrow)"><font-awesome-icon icon="fa-regular fa-circle-up" /></a>
						</div>
					</div>
					<img src="https://placehold.co/600x400?text=C%23+Computer+Project">
				</div>
				<div>
					<!-- CreatorTube -->
					<div class="content">
						<h3>Portfolio</h3>
						<p usage="description of the project">A minimal, dark blue theme for VS Code, Sublime Text, Atom, iTerm, and more. Available on Visual Studio Marketplace, Package Control, Atom Package Manager, and npm.</p>
						<ul>
							<li>HTML, CSS & JS</li>
							<li>TypeScript</li>
							<li>Vue.js (& Vite)</li>
							<li>Node.js</li>
						</ul>
						<div>
							<a usage="a link to github"><!-- Font Awesome --></a>
							<a usage="a 'link' to scroll to the top (up arrow)"><!-- Font Awesome --></a>
						</div>
					</div>
					<img src="https://placehold.co/600x400?text=CreatorTube">
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
		filter: brightness(0.25);
		z-index: -1;
	}

	section > #featured .content {
		width: calc((100% / 5) * 3);
		float: right;
	}

	section > #featured .content ul {
		list-style-type: none;
		padding: 0;
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
			filter: brightness(0.125);
			object-fit: cover;
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
<script setup lang="ts">
</script>

<template>
	<section>
		<article id="skills">
			<header>
				<span></span>
				<div>MY SKILLS</div>
				<span></span>
			</header>
			<main id="lists">
				<!--

					LANGUAGES		FRAMEWORKS		TOOLS & DATABASES 	SOFTWARE			
																							
					HTML, CSS & JS	Node.js			Git & Github		Figma				
					SQL				React			Postman				Photoshop			
					Python			jQuery			CLI					Affinity Designer	
					Java			Express			Font Awesome		Google Workspace	
					C#				Angular/JS		Chrome DevTools		Replit		        
					PHP				Vue.js (& Vite)	Vercel				Stack Blitz			
					C++				.NET (C#)		Discord & Slack		Android Studio	    
					TypeScript		Spring Boot		Stack Overflow		Visual Studio		
					Assembly		Bootstrap		PostgreSQL			VS Code				
					Kotlin			TailwindCSS		MySQL				IntelliJ IDEA		
					SASS & SCSS		Material UI		SQLite				Sublime Text 3	 	

				-->
				<table>
					<thead>
						<tr><th>LANGUAGES</th></tr>
					</thead>
					<tbody>
						<tr><td class="clickable">HTML, CSS & JS</td></tr>
						<tr><td class="clickable">SQL</td></tr>
						<tr><td>Python</td></tr>
						<tr><td class="clickable">Java</td></tr>
						<tr><td class="clickable">C#</td></tr>
						<tr><td>PHP</td></tr>
						<tr><td class="clickable">C++</td></tr>
						<tr><td class="clickable">TypeScript</td></tr>
						<tr><td class="clickable">Assembly</td></tr>
						<tr><td>Kotlin</td></tr>
						<tr><td>SASS & SCSS</td></tr>
					</tbody>
				</table>
				<table>
					<thead>
						<tr><th>FRAMEWORKS</th></tr>
					</thead>
					<tbody>
						<tr><td class="clickable">Node.js</td></tr>
						<tr><td class="clickable">React</td></tr>
						<tr><td class="clickable">jQuery</td></tr>
						<tr><td>Express</td></tr>
						<tr><td>Angular/JS</td></tr>
						<tr><td class="clickable">Vue.js (& Vite)</td></tr>
						<tr><td class="clickable">.NET (C#)</td></tr>
						<tr><td>Spring Boot</td></tr>
						<tr><td>Bootstrap</td></tr>
						<tr><td>TailwindCSS</td></tr>
						<tr><td>Material UI</td></tr>
					</tbody>
				</table>
				<table>
					<thead>
						<tr><th>TOOLS & DATABASES</th></tr>
					</thead>
					<tbody>
						<tr><td class="clickable">Git & Github</td></tr>
						<tr><td>Postman</td></tr>
						<tr><td>CLI</td></tr>
						<tr><td class="clickable">Font Awesome</td></tr>
						<tr><td>Chrome DevTools</td></tr>
						<tr><td>Vercel</td></tr>
						<tr><td class="clickable">Discord & Slack</td></tr>
						<tr><td class="clickable">Stack Overflow</td></tr>
						<tr><td>PostgreSQL</td></tr>
						<tr><td>MySQL</td></tr>
						<tr><td class="clickable">SQLite</td></tr>
					</tbody>
				</table>
				<table>
					<thead>
						<tr><th>SOFTWARE</th></tr>
					</thead>
					<tbody>
						<tr><td class="clickable">Figma</td></tr>
						<tr><td class="clickable">Photoshop</td></tr>
						<tr><td class="clickable">Affinity Designer</td></tr>
						<tr><td>Google Workspace</td></tr>
						<tr><td class="clickable">Replit</td></tr>
						<tr><td class="clickable">StackBlitz</td></tr>
						<tr><td>Android Studio</td></tr>
						<tr><td>Visual Studio</td></tr>
						<tr><td>VS Code</td></tr>
						<tr><td>IntelliJ IDEA</td></tr>
						<tr><td>Sublime Text 3</td></tr>
					</tbody>
				</table>
			</main>
		</article>
		<article id="about">
			<header>ABOUT ME<span></span></header>
			<p>
				Back in 2016, on my 11th birthday, I viewed the page source for google.com. Fast forward 8 years later, I'm a <span><u>Full Stack Developer</u></span> focused on coding digital solutions to real-world problems.
				<br><br>
				With years of professional experience and a diverse skillset, I am a developer capable of handling various aspects of any project. Free to connect and follow my story on <span><b><a href="https://www.linkedin.com/in/timchinye/" target="_blank">LinkedIn</a></b></span>.
			</p>
		</article>
	</section>
</template>

<style scoped>
	section > #skills {
		width: fit-content;
		padding: 6rem 7.5vw;
		border-radius: 0.5rem;
		--background: #262626;
		--accent-background: #292929;
		background: var(--background);
		background-image: linear-gradient(to bottom right, var(--background) 0%, var(--accent-background) 100%);
		box-shadow: 1rem 1rem 2rem #1f1f1f, inset 0.5rem 0.5rem 1rem #2b2b2b;
	}

	section:has(p  >  span:first-child:hover) > #skills > #lists td {
		color: var(--accent-color);
	}

	section:has(p  >  span:first-child:hover) > #skills > #lists table:nth-child(1) td {
		transition-delay: 0s;
	}

	section:has(p  >  span:first-child:hover) > #skills > #lists table:nth-child(2) td {
		transition-delay: 0.25s;
	}

	section:has(p  >  span:first-child:hover) > #skills > #lists table:nth-child(3) td {
		transition-delay: 0.5s;
	}

	section:has(p  >  span:first-child:hover) > #skills > #lists table:nth-child(4) td {
		transition-delay: 1s;
	}

	section > #skills > #lists {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	section > #skills > #lists > table {
		border-collapse: separate;
		border-spacing: 4ch 0;
	}

	section > #skills > #lists > table:last-child {
		margin-left: -4ch;
	}

	section > #skills > #lists th {
		max-width: 12.5vw;
		text-align: left;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	section > #skills > #lists td {
		float: left;
		font-size: 0.75rem;
		white-space: nowrap;
		transition: 0.25s;
	}

	section > #skills > #lists tr:has(td.clickable) {
		cursor: pointer;
	}

	section > #skills > #lists td.clickable {
		position: relative;
	}

	section > #skills > #lists td.clickable:after {
		position: absolute;
		content: '';
		left: 0;
		bottom: calc((1rem / 16) * 3);
		width: 0%;
		height: calc(1rem / 32);
		transition: 0.25s;
		background: var(--accent-color);
	}

	section > #skills > #lists tr:has(td.clickable):hover > td.clickable:after {
		width: 100%;
	}

	section > #about > p {
		width: 25vw;
	}

	section > #about > p > span {
		position: relative;
	}

	section > #about span u {
		text-decoration: none;
	}

	section > #about span u:after,
	section > #about span:after {
		position: absolute;
		content: '';
		left: 0;
		bottom: 0;
		width: 0%;
		height: 0.125rem;
		transition: 0.25s;
		background: var(--accent-color);
	}

	section > #about span:has(u):hover:after {
		transition: 1.25s;
	}

	section > #about span u:after {
		width: 100%;
		background: var(--text-color);
	}

	section > #about span:hover:after {
		width: 100%;
	}

	section > #about span a {
		color: unset;
		text-decoration: unset;
	}

	@media (width < 2104px) {

		section > #skills > #lists > table {
			border-spacing: 0;
			flex: 1 0 33%;
		}

		section > #skills > #lists {
			gap: 2rem;
		}

		section > #skills > #lists > table:last-child {
			margin-left: 0;
		}

	}

	@media (width < 1002px) {
		section > #about {
			padding-bottom: 0;
		}

		section > #about > p {
			width: 100%;
		}
	}

	@media (width <= 568px) {
		section > #skills > #lists > table {
			flex: 1 0 50%;
		}
	}

	@media (width < 508px) {
		section > #skills > header {
			white-space: nowrap;
		}
	}
</style>
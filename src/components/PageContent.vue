<script setup lang="ts">
</script>

<template>
	<section>
		<div id="skills">
			<header>SKILLS</header>
			<div id="lists">
<!--

	LANGUAGES		FRAMEWORKS		TOOLS & DMS 	SOFTWARE			
																			
	HTML, CSS & JS	Node.js			Git & Github		Discord				
	SQL				React			Postman				Replit				
	Python			jQuery			CLI					Figma				
	Java			Express			Font Awesome		Photoshop			
	C#				Angular	& ..JS	Chrome DevTools		Android Studio		
	PHP				Vue.js (& Vite)	AutoHotkey			StackBlitz			
	C++				.NET (C#)		Slack				Affintiy Designer	
	TypeScript		Spring Boot		Stack Overflow		Visual Studio		
	Assembly		Bootstrap		PostgreSQL			VS Code				
	Kotlin			TailwindCSS		MySQL				IntelliJ IDEA		
	SASS & SCSS		Material UI		SQLite				Sublime Text 3	 	
	
-->

				<table>
					<thead>
						<tr>
							<th>LANGUAGES</th>
							<th>FRAMEWORKS</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>HTML, CSS & JS</td>
							<td>Node.js</td>
						</tr>
						<tr>
							<td>SQL</td>
							<td>React</td>
						</tr>
						<tr>
							<td>Python</td>
							<td>jQuery</td>
						</tr>
						<tr>
							<td>Java</td>
							<td>Express</td>
						</tr>
						<tr>
							<td>C#</td>
							<td>Angular & ..JS</td>
						</tr>
						<tr>
							<td>PHP</td>
							<td>Vue.js (& Vite)</td>
						</tr>
						<tr>
							<td>C++</td>
							<td>.NET (C#)</td>
						</tr>
						<tr>
							<td>TypeScript</td>
							<td>Spring Boot</td>
						</tr>
						<tr>
							<td>Assembly</td>
							<td>Bootstrap</td>
						</tr>
						<tr>
							<td>Kotlin</td>
							<td>TailwindCSS</td>
						</tr>
						<tr>
							<td>SASS & SCSS</td>
							<td>Material UI</td>
						</tr>
					</tbody>
				</table>
				<table>
					<thead>
						<tr>
							<th>TOOLS & DATABASES</th>
							<th>SOFTWARE</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Git & Github</td>
							<td>Figma</td>
						</tr>
						<tr>
							<td>Postman</td>
							<td>Photoshop</td>
						</tr>
						<tr>
							<td>CLI</td>
							<td>Affinity Designer</td>
						</tr>
						<tr>
							<td>Font Awesome</td>
							<td>Android Studio</td>
						</tr>
						<tr>
							<td>Chrome DevTools</td>
							<td>Google Workspace</td>
						</tr>
						<tr>
							<td>AutoHotkey</td>
							<td>Replit</td>
						</tr>
						<tr>
							<td>Discord & Slack</td>
							<td>StackBlitz</td>
						</tr>
						<tr>
							<td>Stack Overflow</td>
							<td>Visual Studio</td>
						</tr>
						<tr>
							<td>PostgreSQL</td>
							<td>VS Code</td>
						</tr>
						<tr>
							<td>MySQL</td>
							<td>IntelliJ IDEA</td>
						</tr>
						<tr>
							<td>SQLite</td>
							<td>Sublime Text 3</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>
</template>

<style scoped>
	section {
		margin: 100px 0;
		padding: 0 5.5rem 0 6.5rem;
		box-sizing: border-box;
		width: 100%;
	}

	#skills {
		width: fit-content;
		margin: 0 auto;
		padding: 6rem 10vw;
		border-radius: 1rem;
		--background: #262626;
		--accent-background: #292929;
		background: var(--background);
		background-image: linear-gradient(to bottom right, var(--background) 0%, var(--accent-background) 100%);
		box-shadow: 1rem 1rem 2rem #1f1f1f, inset 0.5rem 0.5rem 1rem #2b2b2b;
	}

	#skills > header {
		font-weight: bold;
		font-size: 1.5rem;
		text-align: center;
		padding-bottom: 2rem;
	}

	#skills > #lists {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#skills > #lists > table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 4ch 0;
	}

	#skills > #lists > table:last-child {
		margin-left: -4ch;
	}

	#skills > #lists th {
		max-width: 10vw;
		text-align: left;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	#skills > #lists td {
		font-size: 0.75rem;
	}

	@media (orientation: portrait) {

		#skills > #lists {
			flex-direction: column;
			gap: 2rem;
		}

		#skills > #lists > table:last-child {
			margin-left: 0;
		}
	}
</style>
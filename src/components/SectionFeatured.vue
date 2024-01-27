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
					<div class="background"></div>
					<div class="content"></div>
				</div>
				<div>
					<!-- C# Computer Project -->
				</div>
				<div>
					<!-- CreatorTube -->
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
        padding: 0 64px;
		display: flex;
		flex-direction: column;
		gap: 96px;
    }

	section > #featured > main > div {
		height: 256px;
		background: red;
	}

    @media (width <= 720px) {
        section > #featured > header > div {
            width: min-content;
        }
    }
</style>
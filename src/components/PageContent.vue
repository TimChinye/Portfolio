<script setup lang="ts">
	import SectionMe from './SectionMe.vue';
	import SectionFeatured from './SectionFeatured.vue';
	import SectionProjects from './SectionProjects.vue';
</script>

<template>
	<SectionMe></SectionMe>
	<SectionFeatured></SectionFeatured>
	<SectionProjects></SectionProjects>
</template>

<style scoped>
	section:deep() {
		margin: 6rem auto;
		padding: 0 5.5rem 0 6.5rem;
		box-sizing: border-box;
		width: clamp(1px, 100dvw, calc(var(--site-width) * 1.00));
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}

	section:deep() header {
		white-space: nowrap;
		font-weight: bold;
		font-size: 1.5rem;
		padding-bottom: 2rem;
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 2rem;
	}

	section:deep() header > span {
		flex: 1;
		border: 0.125rem solid var(--line-colour);
	}

	section:deep() > article {
		padding: 6rem clamp(0px, 5dvw, calc(var(--site-width) * 0.05));
	}

	@media (width <= 1484px) {
		section:deep() {
			gap: 0;
			flex-direction: column;
			padding: 0;
		}

		section:deep() > article:first-child:not(#skills) {
			padding-top: 0;
		}

		section:deep() > article:last-child {
			padding: 0 clamp(0px, 5dvw, calc(var(--site-width) * 0.05));
		}
	}

	@media (width <= 1028px) {
		section:deep() header {
			font-size: 1rem;
			white-space: normal;
		}
	}
</style>

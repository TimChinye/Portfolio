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
		margin: 100px 0;
		padding: 0 5.5rem 0 6.5rem;
		box-sizing: border-box;
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
	}

	section:deep() header {
		font-weight: bold;
		font-size: 1.5rem;
		padding-bottom: 4rem;
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 2rem;
	}

	section:deep() header > span {
		flex: 1;
		border: 1px solid var(--divider-color);
	}

	section:deep() > article {
		padding: 6rem 5vw;
	}

	@media (width < 1002px) {
		section:deep() {
			flex-direction: column;
		}
	}
</style>
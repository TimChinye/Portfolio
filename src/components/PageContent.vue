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
		margin: 6rem 0;
		padding: 0 5.5rem 0 6.5rem;
		box-sizing: border-box;
		width: 100%;
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
		padding-bottom: 4rem;
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
		padding: 6rem 5vw;
	}

	@media (width < 1002px) {
		section:deep() {
			gap: 0;
			flex-direction: column;
			padding: 0;
		}

		section:deep() > article:first-child:not(#skills) {
			padding-top: 0;
		}

		section:deep() > #skills {
			margin: 0 1.5rem;
			margin-bottom: 6rem;
		}

		section:deep() > article:last-child {
			padding: 0 5vw;
		}
	}
</style>

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
		justify-content: space-evenly;
		align-items: center;
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
		border: 0.125rem solid var(--divider-colour);
	}

	section:deep() > article {
		padding: 6rem 5vw;
	}

	@media (width < 1002px) {
		section:deep() {
			flex-direction: column!important;
		}

		section:deep() > article:first-child:not(#skills) {
			padding-top: 0!important;
		}

		section:deep() > #skills {
			margin-bottom: 6rem;
		}

		section:deep() > article:last-child {
			padding-bottom: 0!important;
		}
	}
</style>
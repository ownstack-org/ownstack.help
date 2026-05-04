// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://ownstack.help',
	integrations: [
		starlight({
			title: 'OwnStack',
			description: 'Deploy, manage, and scale apps on stacks you own.',
			logo: {
				src: './src/assets/logo.svg',
				replacesTitle: false,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/ownstack-org' },
			],
			customCss: ['./src/styles/theme.css'],
			editLink: {
				baseUrl: 'https://github.com/ownstack-org/ownstack.help/edit/main/',
			},
			lastUpdated: true,
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			sidebar: [
				{
					label: 'Getting started',
					items: [
						{ label: 'Welcome', slug: 'getting-started/welcome' },
						{ label: 'Install the CLI', slug: 'getting-started/install' },
						{ label: 'Deploy your first app', slug: 'getting-started/first-app' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Apps', slug: 'concepts/apps' },
						{ label: 'Stacks', slug: 'concepts/stacks' },
						{ label: 'Deployments', slug: 'concepts/deployments' },
						{ label: 'Databases', slug: 'concepts/databases' },
						{ label: 'Domains & SSL', slug: 'concepts/domains-and-ssl' },
					],
				},
				{
					label: 'How-to',
					items: [
						{ label: 'Scale processes', slug: 'how-to/scale-processes' },
						{ label: 'Dump a database', slug: 'how-to/dump-a-database' },
						{ label: 'Repair a database link', slug: 'how-to/repair-database-link' },
						{ label: 'Add a custom domain', slug: 'how-to/custom-domain' },
					],
				},
				{
					label: 'CLI reference',
					items: [
						{ label: 'Overview', slug: 'cli/overview' },
						{ label: 'ownstack app', slug: 'cli/app' },
						{ label: 'ownstack deploy', slug: 'cli/deploy' },
						{ label: 'ownstack db', slug: 'cli/db' },
						{ label: 'ownstack stack', slug: 'cli/stack' },
						{ label: 'ownstack profile', slug: 'cli/profile' },
					],
				},
			],
		}),
	],
});

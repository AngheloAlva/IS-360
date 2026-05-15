export interface TutorialStepDefinition {
	id: string
	title: string
	description: string
	targetId: string
}

export interface TutorialDefinition {
	slug: string
	title: string
	description: string
	steps: TutorialStepDefinition[]
}

export interface TutorialLink {
	slug: string
	title: string
	description: string
	href: string
}

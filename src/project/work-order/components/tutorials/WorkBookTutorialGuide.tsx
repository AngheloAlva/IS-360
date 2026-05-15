"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SparklesIcon } from "lucide-react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

import type { TutorialDefinition } from "@/project/tutorials/types"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface WorkBookTutorialGuideProps {
	tutorial: TutorialDefinition
}

export default function WorkBookTutorialGuide({
	tutorial,
}: WorkBookTutorialGuideProps): React.ReactElement {
	const hasAutoStartedRef = useRef(false)
	const suppressAutoAdvanceRef = useRef(false)
	const [isSummaryOpen, setIsSummaryOpen] = useState(false)
	const hasCompletedRef = useRef(false)

	const handleExitAttempt = useCallback((tour: ReturnType<typeof driver>) => {
		const shouldClose = window.confirm("Deseas salir del tutorial?")

		if (!shouldClose) {
			return
		}

		tour.destroy()
	}, [])

	const waitForElement = useCallback((selector: string, timeoutMs = 1200): Promise<boolean> => {
		return new Promise((resolve) => {
			const start = Date.now()
			const tick = () => {
				if (document.querySelector(selector)) {
					resolve(true)
					return
				}

				if (Date.now() - start >= timeoutMs) {
					resolve(false)
					return
				}

				requestAnimationFrame(tick)
			}

			tick()
		})
	}, [])

	const waitForElementToDisappear = useCallback(
		(selector: string, timeoutMs = 1500): Promise<boolean> => {
			return new Promise((resolve) => {
				const start = Date.now()
				const tick = () => {
					if (!document.querySelector(selector)) {
						resolve(true)
						return
					}

					if (Date.now() - start >= timeoutMs) {
						resolve(false)
						return
					}

					requestAnimationFrame(tick)
				}

				tick()
			})
		},
		[]
	)

	const setSubmitDisabled = useCallback((targetId: string, disabled: boolean) => {
		const submitButton = document.querySelector(`[data-tutorial-id='${targetId}'] button`)
		if (!(submitButton instanceof HTMLButtonElement)) {
			return
		}

		submitButton.disabled = disabled
		submitButton.style.pointerEvents = disabled ? "none" : ""
		submitButton.style.opacity = disabled ? "0.55" : ""
	}, [])

	const runProgrammaticClick = useCallback((selector: string) => {
		suppressAutoAdvanceRef.current = true

		const element = document.querySelector(selector)
		if (element instanceof HTMLElement) {
			element.click()
		}

		window.setTimeout(() => {
			suppressAutoAdvanceRef.current = false
		}, 250)
	}, [])

	const tourDriver = useMemo(() => {
		return driver({
			showProgress: true,
			allowClose: false,
			nextBtnText: "Siguiente",
			prevBtnText: "Anterior",
			doneBtnText: "Listo",
			overlayClickBehavior: (_element, _step, opts) => {
				handleExitAttempt(opts.driver)
			},
			onCloseClick: (_element, _step, opts) => {
				handleExitAttempt(opts.driver)
			},
			onPrevClick: (_element, _step, opts) => {
				opts.driver.movePrevious()
			},
			onNextClick: async (_element, _step, opts) => {
				const activeIndex = opts.driver.getActiveIndex() ?? 0
				const currentStep = tutorial.steps[activeIndex]
				const targetId = currentStep?.targetId

				if (targetId === "tutorial-create-milestones") {
					runProgrammaticClick(`[data-tutorial-id='${targetId}']`)

					await waitForElement("[data-tutorial-id='tutorial-milestones-sheet']")
					opts.driver.moveNext()
					return
				}

				if (targetId === "tutorial-milestones-submit") {
					runProgrammaticClick("[data-tutorial-id='tutorial-milestones-submit'] button")

					await waitForElementToDisappear("[data-tutorial-id='tutorial-milestones-sheet']")
					opts.driver.moveNext()
					return
				}

				if (targetId === "tutorial-tab-activities") {
					runProgrammaticClick(`[data-tutorial-id='${targetId}']`)

					await waitForElement("[data-tutorial-id='tutorial-create-activity']")
					opts.driver.moveNext()
					return
				}

				if (targetId === "tutorial-create-activity") {
					runProgrammaticClick(`[data-tutorial-id='${targetId}']`)

					await waitForElement("[data-tutorial-id='tutorial-activity-sheet']")
					opts.driver.moveNext()
					return
				}

				if (targetId === "tutorial-activity-submit") {
					runProgrammaticClick("[data-tutorial-id='tutorial-activity-submit'] button")

					await waitForElementToDisappear("[data-tutorial-id='tutorial-activity-sheet']")
					opts.driver.moveNext()
					return
				}

				if (opts.driver.isLastStep()) {
					hasCompletedRef.current = true
					opts.driver.destroy()
					return
				}

				opts.driver.moveNext()
			},
			onDestroyed: () => {
				if (!hasCompletedRef.current) {
					return
				}

				hasCompletedRef.current = false
				setIsSummaryOpen(true)
			},
			steps: tutorial.steps.map((step) => ({
				element: `[data-tutorial-id='${step.targetId}']`,
				onHighlighted: () => {
					if (step.targetId === "tutorial-milestones-sheet") {
						setSubmitDisabled("tutorial-milestones-submit", true)
					}

					if (step.targetId === "tutorial-activity-sheet") {
						setSubmitDisabled("tutorial-activity-submit", true)
					}
				},
				onDeselected: () => {
					if (step.targetId === "tutorial-milestones-sheet") {
						setSubmitDisabled("tutorial-milestones-submit", false)
					}

					if (step.targetId === "tutorial-activity-sheet") {
						setSubmitDisabled("tutorial-activity-submit", false)
					}
				},
				popover: {
					title: step.title,
					description: step.description,
					side: "bottom",
				},
			})),
		})
	}, [
		handleExitAttempt,
		runProgrammaticClick,
		setSubmitDisabled,
		tutorial,
		waitForElement,
		waitForElementToDisappear,
	])

	useEffect(() => {
		if (hasAutoStartedRef.current || tutorial.steps.length === 0) {
			return
		}

		hasAutoStartedRef.current = true

		const frameId = requestAnimationFrame(() => {
			tourDriver.drive()
		})

		return () => {
			cancelAnimationFrame(frameId)
			tourDriver.destroy()
		}
	}, [tourDriver, tutorial.steps.length])

	const handleStartTutorial = useCallback(() => {
		tourDriver.drive()
	}, [tourDriver])

	useEffect(() => {
		const resolveStepElement = (stepElement: unknown) => {
			if (!stepElement) {
				return null
			}

			if (typeof stepElement === "string") {
				return document.querySelector(stepElement)
			}

			if (typeof stepElement === "function") {
				return stepElement()
			}

			return stepElement
		}

		const handleInteractiveClick = (event: MouseEvent) => {
			if (!tourDriver.isActive()) {
				return
			}

			if (suppressAutoAdvanceRef.current) {
				return
			}

			const target = event.target
			if (!(target instanceof Element)) {
				return
			}

			if (target.closest(".driver-popover")) {
				return
			}

			const isInteractiveTarget =
				target.closest("button") || target.closest("a") || target.closest("[role='button']")

			if (!isInteractiveTarget) {
				return
			}

			window.setTimeout(() => {
				if (!tourDriver.isActive()) {
					return
				}

				const activeStep = tourDriver.getActiveStep()
				const activeElement = resolveStepElement(activeStep?.element)

				if (!activeElement) {
					return
				}

				const clickedInsideStep = activeElement.contains(target) || target.contains(activeElement)
				const targetRemoved = !document.contains(activeElement)

				if (clickedInsideStep || targetRemoved) {
					tourDriver.moveNext()
				}
			}, 150)
		}

		document.addEventListener("click", handleInteractiveClick, true)

		return () => {
			document.removeEventListener("click", handleInteractiveClick, true)
		}
	}, [tourDriver])

	return (
		<>
			<Button
				type="button"
				variant="secondary"
				onClick={handleStartTutorial}
				data-tutorial-id="work-book-tutorial-start"
				className="cursor-pointer"
				disabled={tutorial.steps.length === 0}
			>
				<SparklesIcon className="size-4" />
				Repetir
			</Button>

			<Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Tutorial completado</DialogTitle>
						<DialogDescription>
							Completaste {tutorial.steps.length} pasos de la guia. Puedes repetirla cuando quieras.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsSummaryOpen(false)}>
							Cerrar
						</Button>
						<Button
							onClick={() => {
								setIsSummaryOpen(false)
								handleStartTutorial()
							}}
						>
							Repetir tutorial
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

<script lang="ts">
	import {
		provideVSCodeDesignSystem,
		vsCodeButton,
	} from "@vscode/webview-ui-toolkit";
	import { vscode } from "./utilities/vscode";

	// In order to use the Webview UI Toolkit web components they
	// must be registered with the browser (i.e. webview) using the
	// syntax below.
	provideVSCodeDesignSystem().register(vsCodeButton());

	// To register more toolkit components, simply import the component
	// registration function and call it from within the register
	// function, like so:
	//
	// provideVSCodeDesignSystem().register(
	//   vsCodeButton(),
	//   vsCodeCheckbox()
	// );
	//
	// Finally, if you would like to register all of the toolkit
	// components at once, there's a handy convenience function:
	//
	// provideVSCodeDesignSystem().register(allComponents);
	
	let person: string = "world";
	let dbg:string ="...";

	
	function handleHowdyClick() {
		vscode.postMessage({
			command: "hello",
			text: "Hello there!",
		});
	}

	function handleEnter(e: KeyboardEvent) {
		if (e.key === "Enter") {
			handleHowdyClick();
		}
	}

	function handleMessage(event: any) {
		const message = event.data;
		dbg = "got message";
		console.log("got message", message);
		switch (message.cmd) {
			case "newFunction":
				person = message.name;
				break;
		}
	};

</script>

<svelte:window on:message={handleMessage} />

<main>
	<h1>Oy, Hello {person}!</h1>
	<vscode-button
	on:click={handleHowdyClick}
	on:keyup={handleEnter}
	tabindex="0"
	role="button">
		Howdy!
	</vscode-button>
	<p>{dbg}</p>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		height: 100%;
	}
</style>

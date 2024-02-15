<script lang="ts">
	import {
		allComponents,
		provideVSCodeDesignSystem,
		vsCodeButton,
	} from "@vscode/webview-ui-toolkit";
	import { vscode } from "./utilities/vscode";
    import DeleteButton from "./DeleteButton.svelte";

	provideVSCodeDesignSystem().register(allComponents);
	
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

	function handleDeleteAllClick() {
		vscode.postMessage({
			command: "pending-functions-bookmarks-delete-all",
		});
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
<!--  -->
<main>
	<DeleteButton on:delete={handleDeleteAllClick}/>
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

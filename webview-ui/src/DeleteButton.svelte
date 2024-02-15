<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{
        delete: string;
    }>();

    function handleClick() {
        dispatch("delete", "clicked");
    }

    function handleEnter(e: KeyboardEvent) {
        // if (e.key === "Enter") {
        //     handleClick();
        // }
    }
</script>

<vscode-button
    on:click={handleClick}
    on:keyup={handleEnter}
    tabindex="0"
    aria-label="Delete all"
    role="button"
>
    Delete all
    <span class="codicon codicon-trash pl-1"></span>
</vscode-button>

<style>
    .pl-1 {
        padding-left: 1rem;
    }
</style>

export enum SymbolLocation {
	beginningOfModule = 1,
	endOfModule,
	beforeFunction,
	afterFunction
}

export namespace SymbolLocation {
	export function parse(location: string): SymbolLocation {
		switch (location) {
			case 'beginningOfModule': return SymbolLocation.beginningOfModule;
			case 'endOfModule': return SymbolLocation.endOfModule;
			case 'beforeFunction': return SymbolLocation.beforeFunction;
			case 'afterFunction': return SymbolLocation.afterFunction;
			default: throw new Error(`Unknown symbol location: ${location}`);
		}
	}

	export function label(location: SymbolLocation): string {
		switch (location) {
			case SymbolLocation.beginningOfModule: return 'beginning_of_module';
			case SymbolLocation.endOfModule: return 'end_of_module';
			case SymbolLocation.beforeFunction: return 'before_function';
			case SymbolLocation.afterFunction: return 'after_function';
			default: return "unknown_location";
		}
	}
}
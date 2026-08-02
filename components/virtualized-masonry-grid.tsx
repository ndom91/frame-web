"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

/**
 * Breakpoints mirror the Tailwind grid the media list used before
 * (`md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`). Measured against the
 * container rather than the viewport, so collapsing the sidebar re-flows
 * correctly.
 */
const COLUMN_BREAKPOINTS = [
	{ minWidth: 1280, columns: 4 },
	{ minWidth: 1024, columns: 3 },
	{ minWidth: 768, columns: 2 },
	{ minWidth: 0, columns: 1 },
];

function columnsForWidth(width: number) {
	return (
		COLUMN_BREAKPOINTS.find((breakpoint) => width >= breakpoint.minWidth)
			?.columns ?? 1
	);
}

function useColumnCount(ref: React.RefObject<HTMLDivElement | null>) {
	const [columnCount, setColumnCount] = useState(1);

	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) return;

		const update = (width: number) => {
			const next = columnsForWidth(width);
			setColumnCount((current) => (current === next ? current : next));
		};

		update(element.getBoundingClientRect().width);

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				update(entry.contentRect.width);
			}
		});

		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);

	return columnCount;
}

/**
 * The grid's offset from the top of the document. Each column virtualizer needs
 * this to translate window scroll into its own coordinate space; it's 0 on the
 * first render, before layout.
 */
function useScrollMargin(ref: React.RefObject<HTMLDivElement | null>) {
	const [scrollMargin, setScrollMargin] = useState(0);

	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) return;

		const update = () => {
			const offset =
				element.getBoundingClientRect().top +
				(typeof window === "undefined" ? 0 : window.scrollY);
			setScrollMargin((current) => (current === offset ? current : offset));
		};

		update();

		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, [ref]);

	return scrollMargin;
}

function MasonryColumn<T>({
	items,
	renderItem,
	getKey,
	scrollMargin,
	estimateSize,
	gap,
}: {
	items: T[];
	renderItem: (item: T) => React.ReactNode;
	getKey: (item: T) => string;
	scrollMargin: number;
	estimateSize: number;
	gap: number;
}) {
	const virtualizer = useWindowVirtualizer({
		count: items.length,
		estimateSize: () => estimateSize,
		overscan: 4,
		scrollMargin,
		gap,
	});

	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div
			className="relative min-w-0 flex-1"
			style={{ height: virtualizer.getTotalSize() }}
		>
			{virtualItems.map((virtualItem) => {
				const item = items[virtualItem.index];

				return (
					<div
						key={getKey(item)}
						data-index={virtualItem.index}
						// measureElement is ResizeObserver-backed, so each card re-measures
						// once its image decodes — that's what makes variable-height cards
						// work without cropping them to a fixed ratio.
						ref={virtualizer.measureElement}
						className="absolute top-0 left-0 w-full"
						style={{
							transform: `translateY(${virtualItem.start - scrollMargin}px)`,
						}}
					>
						{renderItem(item)}
					</div>
				);
			})}
		</div>
	);
}

export function VirtualizedMasonryGrid<T>({
	items,
	renderItem,
	getKey,
	estimateSize = 340,
	gap = 16,
	className,
}: {
	items: T[];
	renderItem: (item: T) => React.ReactNode;
	getKey: (item: T) => string;
	/** Rough card height before measurement; only affects early scrollbar accuracy. */
	estimateSize?: number;
	/** Gap in px, applied both between and within columns. */
	gap?: number;
	className?: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const columnCount = useColumnCount(containerRef);
	const scrollMargin = useScrollMargin(containerRef);

	// Round-robin rather than shortest-column-first: heights aren't known until
	// images decode, so a height-aware assignment would reshuffle cards as they
	// load. This is deterministic and keeps left-to-right reading order.
	const columns = useMemo(() => {
		const buckets: T[][] = Array.from({ length: columnCount }, () => []);
		items.forEach((item, index) => {
			buckets[index % columnCount].push(item);
		});
		return buckets;
	}, [items, columnCount]);

	return (
		<div
			ref={containerRef}
			className={className}
			style={{ display: "flex", alignItems: "flex-start", gap }}
		>
			{columns.map((columnItems, columnIndex) => (
				<MasonryColumn
					key={columnIndex}
					items={columnItems}
					renderItem={renderItem}
					getKey={getKey}
					scrollMargin={scrollMargin}
					estimateSize={estimateSize}
					gap={gap}
				/>
			))}
		</div>
	);
}

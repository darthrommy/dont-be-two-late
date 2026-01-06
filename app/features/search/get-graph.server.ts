import STATION_GRAPH from "./static/station-graph.json";
import STATIONS from "./static/stations.json";
import type { FlattenedGraph, GraphNode } from "./types";

export type STATION_KEYS = keyof typeof STATION_GRAPH;

const resolveStationFromId = (stationId: STATION_KEYS) => {
	const station = STATIONS.find((s) => s.id === stationId);
	if (!station) {
		throw new Error(`Station not found: ${stationId}`);
	}
	return station;
};

const buildGraph = (
	from: STATION_KEYS,
	current: STATION_KEYS,
	parent: GraphNode,
	visited: Set<string>,
): GraphNode => {
	const previous = STATION_GRAPH[current].prev;
	const identicals = STATION_GRAPH[current].identical;

	const resolvedIdenticals = identicals.map((id) => {
		const station = resolveStationFromId(id as STATION_KEYS);
		return {
			id: station.id,
		};
	});

	const nextCurrents = [...previous, ...resolvedIdenticals];

	// mark current station and its connections as visited
	const currentInfo = resolveStationFromId(current);
	const currentVisited = new Set(visited);
	for (const connId of currentInfo.connection) {
		currentVisited.add(connId);
	}

	for (const prev of nextCurrents) {
		// ループを阻止
		if (visited.has(prev.id)) {
			continue;
		}

		const prevVisited = new Set(currentVisited);
		prevVisited.add(prev.id);

		const prevStationInfo = resolveStationFromId(prev.id as STATION_KEYS);

		const node: GraphNode = {
			id: prev.id,
			railway: prevStationInfo.railway,
			operator: prevStationInfo.operator,
			event: identicals.includes(prev.id) ? "transfer" : "passthrough",
			prev: [],
		};

		parent.prev.push(node);

		if (prev.id === from) {
			node.event = "terminal";
			return parent;
		}

		buildGraph(from, prev.id as STATION_KEYS, node, prevVisited);
	}

	return parent;
};

/**
 * Flatten the graph into an array of all possible paths
 * @param node Current graph node
 * @param currentPath Current path being built
 * @param path All paths collected so far
 * @returns All possible paths from the graph
 */
const flattenGraph = (
	node: GraphNode,
	currentPath: FlattenedGraph[] = [],
	paths: FlattenedGraph[][] = [],
): FlattenedGraph[][] => {
	const nextNode = {
		id: node.id,
		railway: node.railway,
		event: node.event,
		operator: node.operator,
	} satisfies FlattenedGraph;

	const newPath = [...currentPath, nextNode];

	if (node.prev.length === 0) {
		// Leaf node, add the current path to paths
		paths.push(newPath);
	} else {
		// Recurse for each previous node
		for (const child of node.prev) {
			flattenGraph(child, newPath, paths);
		}
	}

	return paths;
};

/**
 * Filter paths that end at the 'from' station
 * @param from the `from` station ID
 * @param paths all flattened paths
 * @returns Valid paths ending at 'from' station
 */
const getValidPaths = (from: STATION_KEYS, paths: FlattenedGraph[][]) => {
	return paths.filter((path) => path.at(-1)?.id === from);
};

/**
 * Get the station graph from 'from' to 'to' station backwards
 * @param from the `from` station ID
 * @param to the `to` station ID
 * @returns The station graph and its flattened paths
 */
export const getGraph = (from: STATION_KEYS, to: STATION_KEYS) => {
	// get to-station info
	const toStation = resolveStationFromId(to);
	const fromStation = resolveStationFromId(from);

	// mark goal station and its connections as visited to prevent loops
	const visited = new Set<string>();
	visited.add(toStation.id);
	for (const connId of toStation.connection) {
		visited.add(connId);
	}
	for (const connId of fromStation.connection) {
		visited.add(connId);
	}

	// build graph from 'to' to 'from'
	const rootNode: GraphNode = {
		id: toStation.id,
		railway: toStation.railway,
		operator: toStation.operator,
		event: "terminal",
		prev: [],
	};

	const fullGraph = buildGraph(from, to, rootNode, visited);

	const flattenedPaths = flattenGraph(fullGraph);
	const validPaths = getValidPaths(from, flattenedPaths);

	return { flattenedPaths, fullGraph, validPaths };
};

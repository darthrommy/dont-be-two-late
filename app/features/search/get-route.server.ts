import type { FlattenedGraph, RouteItem } from "./types";

/**
 * Extract valid route segments from flattened graph paths
 * @param paths Flattened graph paths
 * @returns Valid route segments
 */
export const getValidRoutes = (paths: FlattenedGraph[][]) => {
	return paths.map((path) => {
		// 経路が短すぎて区間を作れない場合はスキップ（念のため）
		if (path.length < 2) return [];

		const routes: RouteItem[] = [];

		// 現在のセグメント（路線）の開始地点を記録しておく変数
		let segmentStartNode = path[0];

		// 1番目の要素から走査開始（0番目は開始地点として設定済み）
		for (let i = 1; i < path.length; i++) {
			const currentNode = path[i];
			const prevNode = path[i - 1];

			// 乗り換えが発生したかチェック
			if (currentNode.event === "transfer") {
				// 変わった場合、前の路線区間を確定させる
				// 区間: [セグメント開始駅] -> [直前の駅]
				routes.push({
					toId: segmentStartNode.id,
					fromId: prevNode.id,
					railway: segmentStartNode.railway,
					operator: segmentStartNode.operator,
				});

				// 新しい路線の開始地点として、現在のノード（乗換先）をセット
				segmentStartNode = currentNode;
			}
		}

		// // ループ終了後、最後の区間（最後の乗換駅から終点まで）を追加
		// // ただし、「始点」と「終点」が同じ（＝移動距離ゼロ）の場合は除外するガードを入れる
		const lastNode = path[path.length - 1];

		// if (segmentStartNode.id !== lastNode.id) {
		routes.push({
			toId: segmentStartNode.id,
			fromId: lastNode.id,
			railway: segmentStartNode.railway,
			operator: segmentStartNode.operator,
		});
		// }

		// 一つの駅を出入りするだけの余計なノードができてしまうので排除
		return routes.flatMap((route) =>
			route.fromId !== route.toId ? [route] : [],
		);
	});
};

<script>
	import { csvParse } from "d3-dsv";
	import { csv } from "d3-fetch";
	import data from "../data.csv";

	$effect(() => $inspect({ data }));
</script>

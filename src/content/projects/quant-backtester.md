<script module lang="ts">
	export const metadata = {
		title: '(ignore) Systematic Strategy Backtester',
		summary:
			'A modular backtesting engine for testing systematic strategies with configurable risk controls and reporting.',
		period: '2025',
		techStack: ['Python', 'Pandas', 'FastAPI', 'PostgreSQL'],
		featured: true,
		repoUrl: 'https://github.com/'
	};
</script>

## Problem

Testing strategy ideas quickly usually creates throwaway scripts that are hard to
trust. This project introduces a consistent pipeline for strategy simulation.

## Core Features

- Reproducible data ingestion pipeline
- Strategy interface with pluggable indicators
- Risk metrics including drawdown and rolling Sharpe

## Notes

The architecture keeps validation and reporting separate from strategy code, which
improves maintainability as strategy complexity grows.

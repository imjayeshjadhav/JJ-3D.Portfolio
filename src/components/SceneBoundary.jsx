import { Component } from "react";

// If a 3D scene fails (lost context, model fetch error), show the fallback
// instead of taking the whole page down with it.
class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("3D scene failed:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}

export default SceneBoundary;

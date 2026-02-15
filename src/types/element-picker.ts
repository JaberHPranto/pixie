export interface SelectedElement {
  tagName: string;
  textContent: string;
  className: string;
  id: string;
  selector: string;
  outerHTML: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

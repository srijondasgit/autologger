1. Download dataset from Roboflow
2. yolo detect train model=yolov8n.pt data=data.yaml epochs=1 device=mps
3. Export to ONNX and format for android and iphone
3.1 for Android
3.2 for Iphone
```pip install --upgrade ultralytics onnx && python3 -c "
from ultralytics import YOLO

print('Loading model...')
model = YOLO('best.pt')

print('Exporting to ONNX (320)...')
model.export(format='onnx', imgsz=320, opset=17, dynamic=False, simplify=True)

print('Export complete: best.onnx')
"
```

"""تهيئة محلية لبيئة بايثون داخل python-service."""

import os

# عزل pytest عن الإضافات الخارجية المثبتة على مستوى النظام لتفادي أعطال غير متوقعة.
# يمكن تعطيل هذا السلوك عند الحاجة عبر ضبط المتغير مسبقاً.
os.environ.setdefault('PYTEST_DISABLE_PLUGIN_AUTOLOAD', '1')

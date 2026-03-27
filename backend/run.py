"""
Main entry point for the Flask application
"""

import os

from app import create_app

if __name__ == '__main__':
    app = create_app()
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=5000, use_reloader=False)

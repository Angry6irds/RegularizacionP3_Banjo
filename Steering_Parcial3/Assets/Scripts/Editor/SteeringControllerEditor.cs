#if UNITY_EDITOR
using UnityEditor;
using System;
using System.Linq;
using Sterring.Core;
using UnityEngine;


    [CustomEditor(typeof(SteeringController))]
    public class SteeringControllerEditor : Editor
    {
        private static Type[] _cachedTypes;
        private static Type[] SteeringTypes => _cachedTypes ??= AppDomain.CurrentDomain.GetAssemblies().SelectMany(a => a.GetTypes()).Where(t => t.IsSubclassOf(typeof(SteeringBehaviour)) && !t.IsAbstract).ToArray();
        public override void OnInspectorGUI()
        {
            DrawDefaultInspector();
            SteeringController ctrl = (SteeringController)target;
            EditorGUILayout.Space(10);
            EditorGUILayout.LabelField("Steering Controller", EditorStyles.boldLabel);
            var types = SteeringTypes;

            foreach (var type in types)
            {
                if (GUILayout.Button($"+ Add {type.Name}"))
                {
                    Undo.RecordObject(ctrl, $"Add {type.Name}");
                    ctrl.behaviours.Add((SteeringBehaviour)Activator.CreateInstance(type));
                    EditorUtility.SetDirty(ctrl);
                }
            }

            if (ctrl.behaviours.Any(b => b == null))
            {
                EditorGUILayout.Space(5);
                if (GUILayout.Button($"Remove {ctrl.GetType().Name}"))
                    ctrl.behaviours.RemoveAll(b => b == null);
            }
        }
    }
#endif